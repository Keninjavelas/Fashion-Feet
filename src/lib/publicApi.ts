import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Transport helpers for the public, unauthenticated `/api/v1` surface.
 *
 * This surface exists so a native mobile client — which cannot consume React
 * Server Components — can read the same published catalogue the website shows.
 * It is deliberately:
 *
 *   - read-only          (no POST/PUT/PATCH/DELETE handler exists anywhere here)
 *   - credential-free    (it never reads or accepts a session, and never sets
 *                         `Access-Control-Allow-Credentials`, so a browser
 *                         cannot ride an admin cookie into it)
 *   - rate-limited       (an unauthenticated endpoint with no throttle is a
 *                         trivial denial-of-service vector)
 *   - fail-quiet         (errors are logged server-side and returned as a
 *                         generic message; this codebase already established
 *                         that pattern after defect #14 leaked error.message)
 *
 * Field shaping is NOT done here — see `publicSerializers.ts`, which whitelists
 * every response field explicitly.
 */

const DEFAULT_LIMIT = 24;

/**
 * Hard ceiling on page size. A caller cannot ask for an unbounded result set,
 * which would make the endpoint an easy amplification target.
 */
const MAX_LIMIT = 60;

const RATE_LIMIT_MAX_REQUESTS = 120;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_LOCKOUT_MS = 60_000;

export const PUBLIC_CORS_HEADERS: Readonly<Record<string, string>> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

/**
 * Throwable that carries an HTTP status, so a handler can signal "not found" or
 * "bad request" without every call site hand-rolling a response.
 */
export class PublicApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "PublicApiError";
  }
}

export function jsonOk(data: unknown, cacheSeconds = 60): NextResponse {
  return NextResponse.json(data, {
    status: 200,
    headers: {
      ...PUBLIC_CORS_HEADERS,
      // Public read-only content: safe to cache at the edge, and cheap to serve
      // stale while revalidating. No `private`/`no-store` because there is no
      // per-user data on this surface at all.
      "Cache-Control": `public, max-age=${cacheSeconds}, stale-while-revalidate=300`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function jsonError(status: number, message: string, extraHeaders?: Record<string, string>): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        ...PUBLIC_CORS_HEADERS,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...extraHeaders,
      },
    }
  );
}

/**
 * CORS preflight. A native client does not enforce CORS, but a WebView, an
 * Expo web build and browser-based tooling do, so this is answered properly
 * rather than left to fall through to a 405.
 */
export function preflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: { ...PUBLIC_CORS_HEADERS } });
}

function clientKey(req: NextRequest): string {
  // Behind the production reverse proxy the first X-Forwarded-For entry is the
  // real client. Falls back to a single shared bucket rather than trusting a
  // spoofable header alone, and never falls back to "unlimited".
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `public-api:${ip}`;
}

/**
 * Wraps a handler with rate limiting, error containment and CORS. Every route on
 * this surface goes through it, so none of them can accidentally ship without a
 * throttle or leak an exception message to the caller.
 */
export async function publicGet(
  req: NextRequest,
  handler: () => Promise<unknown>,
  options: { cacheSeconds?: number } = {}
): Promise<NextResponse> {
  const { allowed, retryAfterSeconds } = checkRateLimit(clientKey(req), {
    maxAttempts: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
    lockoutMs: RATE_LIMIT_LOCKOUT_MS,
  });

  if (!allowed) {
    return jsonError(429, "Too many requests. Please slow down.", {
      "Retry-After": String(retryAfterSeconds ?? 60),
    });
  }

  try {
    return jsonOk(await handler(), options.cacheSeconds ?? 60);
  } catch (error) {
    if (error instanceof PublicApiError) {
      return jsonError(error.status, error.message);
    }
    // Detail stays server-side. The caller gets nothing to fingerprint the
    // application with.
    console.error("[api/v1] unhandled error:", error);
    return jsonError(500, "Internal server error");
  }
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ListEnvelope<T> {
  data: T[];
  pagination: Pagination;
}

export function parsePagination(req: NextRequest): { limit: number; offset: number } {
  const params = req.nextUrl.searchParams;
  const rawLimit = Number(params.get("limit"));
  const rawOffset = Number(params.get("offset"));

  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), MAX_LIMIT) : DEFAULT_LIMIT;
  const offset = Number.isFinite(rawOffset) && rawOffset > 0 ? Math.floor(rawOffset) : 0;

  return { limit, offset };
}

/**
 * Normalises a free-text filter. Caps length so an oversized value cannot be
 * used to build a pathological query, and returns null for "not supplied".
 */
export function readFilter(req: NextRequest, key: string): string | null {
  const raw = req.nextUrl.searchParams.get(key);
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 120);
}
