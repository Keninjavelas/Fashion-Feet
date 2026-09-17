import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { answerJudyQuestion, JUDY_UNAVAILABLE_REPLY } from "@/lib/judy";
import type { JudyAnswer, JudyHistoryMessage } from "@/lib/judy/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/judy
 *
 * Body: { message: string, history?: { role: "user" | "assistant", content: string }[] }
 * 200:  { reply: string, source: "offline" | "groq" | "gemini" | "openai",
 *         grounded: boolean, links: string[] }
 * 400:  { error: string }
 * 429:  { error: string } with a `Retry-After` header
 *
 * Every path that is not a validation rejection answers HTTP 200 with something
 * a customer can read. A provider outage, an invalid key or a timeout is a
 * server-side log line, not a broken bubble in the UI.
 *
 * Nothing here is read from the browser: no provider name, endpoint, model id or
 * credential is ever placed in the response. `answerJudyQuestion` runs entirely
 * server-side, and `JUDY_API_KEY` has no `NEXT_PUBLIC_` prefix, so it is not
 * inlined into any client bundle.
 */

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 8;
const MAX_HISTORY_MESSAGE_LENGTH = 500;

/**
 * Per-IP throttle. Tighter than the read-only `/api/v1` surface because this
 * endpoint is a POST that can trigger an outbound provider call, and looser than
 * an auth endpoint because a real customer may reasonably ask several questions
 * in a row. The lockout is a minute so a genuine visitor recovers quickly.
 */
const JUDY_RATE_LIMIT = { maxAttempts: 10, windowMs: 60_000, lockoutMs: 60_000 };

function clientKey(req: NextRequest): string {
  // Same trust model as `publicApi.ts`: behind the reverse proxy the first
  // X-Forwarded-For entry is the real client, and when nothing identifies the
  // caller they share one bounded bucket rather than getting unlimited access.
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `judy:${ip}`;
}

function jsonResponse(body: unknown, status: number, extraHeaders?: Record<string, string>): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

function sanitizeHistory(raw: unknown): JudyHistoryMessage[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => {
      if (!turn || typeof turn !== "object") return null;
      const role = (turn as { role?: unknown }).role;
      const content = (turn as { content?: unknown }).content;
      if (role !== "user" && role !== "assistant") return null;
      if (typeof content !== "string") return null;
      const trimmed = content.trim().slice(0, MAX_HISTORY_MESSAGE_LENGTH);
      if (!trimmed) return null;
      return { role, content: trimmed } as JudyHistoryMessage;
    })
    .filter((turn): turn is JudyHistoryMessage => turn !== null);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { allowed, retryAfterSeconds } = checkRateLimit(clientKey(req), JUDY_RATE_LIMIT);

  if (!allowed) {
    return jsonResponse(
      { error: "Too many questions in a row. Please wait a moment and try again." },
      429,
      { "Retry-After": String(retryAfterSeconds ?? 60) }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return jsonResponse({ error: "Judy could not read that request." }, 400);
  }

  const message = (rawBody as { message?: unknown } | null)?.message;

  if (typeof message !== "string" || message.trim().length === 0) {
    return jsonResponse({ error: "Please type a question so Judy can help." }, 400);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse(
      { error: `That question is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.` },
      400
    );
  }

  const history = sanitizeHistory((rawBody as { history?: unknown } | null)?.history);

  try {
    const answer: JudyAnswer = await answerJudyQuestion({ message: message.trim(), history });
    return jsonResponse(answer, 200);
  } catch (error) {
    // Should be unreachable — both the retrieval and provider layers contain
    // their own failures — but a chat endpoint that 500s is a broken panel, so
    // this is the last line of defence.
    console.error("[api/judy] unhandled error:", error);
    return jsonResponse(
      {
        reply: JUDY_UNAVAILABLE_REPLY,
        source: "offline",
        grounded: false,
        links: ["/contact"],
      } satisfies JudyAnswer,
      200
    );
  }
}

/** Browsers preflighting a same-origin POST should not 405. */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
