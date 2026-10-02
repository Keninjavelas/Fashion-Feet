import type {
  Appearance,
  Category,
  Collection,
  Faq,
  Occasion,
  PaginatedEnvelope,
  Pagination,
  Product,
  SiteConfig,
  SiteHomepage,
  SiteHomepageSection,
  Store,
} from './types';
import { apiCache, buildCacheKey } from './cache';

/**
 * The one and only HTTP client for the Fashion Feet public API.
 *
 * Everything that knows about URLs, headers, status codes, timeouts, rate limits
 * and response validation lives here. Screens import `api` and typed models —
 * they never build a URL and never hardcode a host.
 *
 * Properties of this surface, mirrored from the server (`src/lib/publicApi.ts`):
 *   - GET only, no authentication, no cookies, so nothing here sends credentials
 *   - list endpoints answer `{ data: T[] }`, `/products` adds `pagination`
 *   - failures answer `{ error: string }`; 429 adds a `Retry-After` header
 */

/* -------------------------------------------------------------------------- */
/* Base URL                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Fallback used when `EXPO_PUBLIC_API_BASE_URL` is not set.
 *
 * `10.0.2.2` is the address an **Android emulator** uses to reach the host
 * machine's `localhost`. From inside the emulator, `localhost` is the emulator
 * itself, so the fallback deliberately is NOT localhost. On the iOS simulator or
 * a physical device, set the variable (see mobile/README.md).
 */
const LOCAL_DEV_FALLBACK_BASE_URL = 'http://10.0.2.2:3000';

function readConfiguredBaseUrl(): string | null {
  // The literal `process.env.EXPO_PUBLIC_*` form matters: Metro inlines this
  // expression at build time. Reading the value any other way (e.g. via
  // `globalThis`) would compile but silently resolve to undefined at runtime.
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const API_BASE_URL: string = (readConfiguredBaseUrl() ?? LOCAL_DEV_FALLBACK_BASE_URL).replace(/\/+$/, '');

/** True when no EXPO_PUBLIC_API_BASE_URL was configured and the dev fallback is in use. */
export const IS_USING_FALLBACK_BASE_URL: boolean = readConfiguredBaseUrl() === null;

/** Hard ceiling the API enforces on `limit` (see MAX_LIMIT in src/lib/publicApi.ts). */
export const PRODUCT_LIMIT_MAX = 60;

/* -------------------------------------------------------------------------- */
/* Errors                                                                      */
/* -------------------------------------------------------------------------- */

interface ApiErrorOptions {
  status?: number;
  retryAfterSeconds?: number | null;
  aborted?: boolean;
}

/**
 * Every failure reaches the UI as one of these, so screens only ever have to
 * render `error.message` (plus a retry affordance) instead of pattern-matching
 * on fetch internals.
 */
export class ApiError extends Error {
  /** HTTP status, or 0 when the request never produced a response at all. */
  readonly status: number;
  /** Value of Retry-After on a 429, in seconds, when the server sent one. */
  readonly retryAfterSeconds: number | null;
  /** True when the caller cancelled the request; hooks use this to stay silent. */
  readonly aborted: boolean;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? 0;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
    this.aborted = options.aborted ?? false;
  }
}

/** Normalises anything thrown by a loader into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error && error.name === 'AbortError') {
    return new ApiError('Request cancelled.', { aborted: true });
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return new ApiError(error.message, { status: 0 });
  }
  return new ApiError('Something went wrong while talking to the Fashion Feet API.', { status: 0 });
}

/* -------------------------------------------------------------------------- */
/* Transport                                                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_TIMEOUT_MS = 15_000;

type QueryValue = string | number | undefined | null;
type QueryParams = Record<string, QueryValue>;

function buildQueryString(params: QueryParams): string {
  return Object.entries(params)
    .filter(([, value]) => {
      if (value === undefined || value === null) return false;
      return String(value).trim().length > 0;
    })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

async function requestJson(path: string, params: QueryParams = {}, externalSignal?: AbortSignal): Promise<unknown> {
  const queryString = buildQueryString(params);
  const cacheKey = buildCacheKey(path, queryString);

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, DEFAULT_TIMEOUT_MS);

  const forwardAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', forwardAbort);
  }

  let lastError: unknown = null;

  try {
    const response = await fetch(buildUrl(path, queryString), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw await toHttpError(response);
    const body = await readJsonBody(response);
    await apiCache.write(cacheKey, body, response.status);
    return body;
  } catch (error) {
    lastError = error;
    if (error instanceof ApiError) throw error;
    if (externalSignal?.aborted) throw new ApiError('Request cancelled.', { aborted: true });
    if (timedOut) {
      throw new ApiError(
        `The Fashion Feet API at ${API_BASE_URL} did not answer within ${DEFAULT_TIMEOUT_MS / 1000} seconds.`,
        { status: 0 }
      );
    }
    throw new ApiError(
      `Could not reach the Fashion Feet API at ${API_BASE_URL}. Check that the server is running and reachable from this device — an Android emulator must use 10.0.2.2, not localhost.`,
      { status: 0 }
    );
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', forwardAbort);

    if (lastError !== null && !(lastError instanceof ApiError && lastError.aborted)) {
      const cached = await apiCache.read(cacheKey);
      if (cached.entry !== null) {
        const parsed = apiCache.parseBody<unknown>(cached.entry);
        if (parsed !== null) {
          return parsed;
        }
      }
    }
  }
}

function buildUrl(path: string, queryString: string): string {
  return queryString.length > 0 ? `${API_BASE_URL}${path}?${queryString}` : `${API_BASE_URL}${path}`;
}

async function readJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim().length === 0) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError('The Fashion Feet API returned a response that was not valid JSON.', {
      status: response.status,
    });
  }
}

async function toHttpError(response: Response): Promise<ApiError> {
  const retryAfterSeconds = parseRetryAfterSeconds(response.headers.get('Retry-After'));

  // The documented error shape is `{ error: string }`. Fall back to a
  // status-derived message rather than showing the customer nothing.
  let serverMessage: string | null = null;
  try {
    const body: unknown = await readJsonBody(response);
    if (isRecord(body) && typeof body.error === 'string' && body.error.trim().length > 0) {
      serverMessage = body.error.trim();
    }
  } catch {
    // Body was not JSON; the status code is more useful than the parse failure.
  }

  if (response.status === 429) {
    const suffix = retryAfterSeconds === null ? '' : ` Try again in about ${retryAfterSeconds}s.`;
    return new ApiError(`The API is rate-limiting requests from this device.${suffix}`, {
      status: 429,
      retryAfterSeconds,
    });
  }
  if (response.status >= 500) {
    return new ApiError(serverMessage ?? 'The Fashion Feet API reported a server error.', {
      status: response.status,
    });
  }
  return new ApiError(serverMessage ?? `The Fashion Feet API rejected the request (HTTP ${response.status}).`, {
    status: response.status,
  });
}

function parseRetryAfterSeconds(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header.trim());
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null;
}

/* -------------------------------------------------------------------------- */
/* Runtime validation                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Lightweight guards. They are not a full schema validator: they assert the
 * fields the UI actually dereferences, and reject anything that could crash a
 * screen mid-render. Nullable fields that arrive missing are treated as null by
 * the renderers, which only ever test them for truthiness.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNullableString(value: unknown): value is string | null {
  return value === null || value === undefined || typeof value === 'string';
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || value === undefined || typeof value === 'number';
}

export function isProduct(value: unknown): value is Product {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.category === 'string' &&
    typeof value.gender === 'string' &&
    typeof value.price === 'number' &&
    typeof value.effectivePrice === 'number' &&
    typeof value.createdAt === 'string' &&
    isStringArray(value.images) &&
    isStringArray(value.sizes) &&
    isStringArray(value.colors) &&
    isNullableString(value.sku) &&
    isNullableNumber(value.promoPrice) &&
    isRecord(value.flags)
  );
}

function isCategory(value: unknown): value is Category {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.displayOrder === 'number'
  );
}

function isOccasion(value: unknown): value is Occasion {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.displayOrder === 'number'
  );
}

function isCollection(value: unknown): value is Collection {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' && typeof value.title === 'string' && typeof value.displayOrder === 'number'
  );
}

function isStore(value: unknown): value is Store {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.status === 'string' &&
    typeof value.city === 'string' &&
    isStringArray(value.services) &&
    isStringArray(value.photos)
  );
}

function isFaq(value: unknown): value is Faq {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.question === 'string' &&
    typeof value.answer === 'string' &&
    typeof value.category === 'string' &&
    typeof value.isPinned === 'boolean'
  );
}

export function isHomepageSection(value: unknown): value is SiteHomepageSection {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    typeof value.title === 'string' &&
    typeof value.displayOrder === 'number'
  );
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readAppearance(value: unknown): Appearance {
  const record = isRecord(value) ? value : {};
  return {
    primaryColor: readNullableString(record.primaryColor),
    accentGold: readNullableString(record.accentGold),
    typography: readNullableString(record.typography),
    buttonStyle: readNullableString(record.buttonStyle),
    cardRadius: readNullableString(record.cardRadius),
  };
}

function readHomepage(value: unknown): SiteHomepage {
  const record = isRecord(value) ? value : {};
  const sections = Array.isArray(record.sections) ? record.sections.filter(isHomepageSection) : [];
  return {
    page: readNullableString(record.page) ?? 'homepage',
    version: typeof record.version === 'number' ? record.version : null,
    publishedAt: readNullableString(record.publishedAt),
    sections,
  };
}

function unwrapData(payload: unknown): unknown {
  if (isRecord(payload) && 'data' in payload) return payload.data;
  throw new ApiError('Unexpected response from the Fashion Feet API: no "data" field was present.', {
    status: 0,
  });
}

function readPagination(payload: unknown, pageSize: number, limit: number, offset: number): Pagination {
  const raw = isRecord(payload) && isRecord(payload.pagination) ? payload.pagination : null;
  if (!raw) {
    // Older/partial responses still render: infer what we can from the page we got.
    return { total: offset + pageSize, limit, offset, hasMore: false };
  }
  const total = typeof raw.total === 'number' ? raw.total : offset + pageSize;
  return {
    total,
    limit: typeof raw.limit === 'number' ? raw.limit : limit,
    offset: typeof raw.offset === 'number' ? raw.offset : offset,
    hasMore: typeof raw.hasMore === 'boolean' ? raw.hasMore : offset + pageSize < total,
  };
}

/* -------------------------------------------------------------------------- */
/* Resource calls                                                              */
/* -------------------------------------------------------------------------- */

export interface ProductQuery {
  /** Category slug or name. */
  category?: string;
  /** Occasion slug or name. */
  occasion?: string;
  /** Collection id or title. */
  collection?: string;
  /** Substring match against title/description/category/occasion. */
  q?: string;
  /** Defaults to the server's 24; the server clamps to PRODUCT_LIMIT_MAX. */
  limit?: number;
  offset?: number;
}

async function listProducts(
  query: ProductQuery = {},
  signal?: AbortSignal
): Promise<PaginatedEnvelope<Product>> {
  const limit = clampLimit(query.limit);
  const offset = typeof query.offset === 'number' && query.offset > 0 ? Math.floor(query.offset) : 0;

  const payload = await requestJson(
    '/api/v1/products',
    { category: query.category, occasion: query.occasion, collection: query.collection, q: query.q, limit, offset },
    signal
  );
  const data = unwrapData(payload);
  if (!Array.isArray(data)) {
    throw new ApiError('Unexpected response from /api/v1/products: "data" was not an array.', { status: 0 });
  }
  const items = data.filter(isProduct);
  return { data: items, pagination: readPagination(payload, items.length, limit, offset) };
}

function clampLimit(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 24;
  return Math.min(Math.floor(value), PRODUCT_LIMIT_MAX);
}

async function getProduct(idOrSku: string, signal?: AbortSignal): Promise<Product> {
  // There is no slug on this API: the path segment is the cuid id OR the unique sku.
  const payload = await requestJson(`/api/v1/products/${encodeURIComponent(idOrSku)}`, {}, signal);
  const data = unwrapData(payload);
  if (!isProduct(data)) {
    throw new ApiError('Unexpected response from /api/v1/products/:id — it did not match the documented shape.', {
      status: 0,
    });
  }
  return data;
}

async function readList<T>(
  path: string,
  guard: (value: unknown) => value is T,
  signal?: AbortSignal
): Promise<T[]> {
  const payload = await requestJson(path, {}, signal);
  const data = unwrapData(payload);
  if (!Array.isArray(data)) {
    throw new ApiError(`Unexpected response from ${path}: "data" was not an array.`, { status: 0 });
  }
  // A single malformed row is dropped rather than blanking the whole screen.
  return data.filter(guard);
}

async function getSite(signal?: AbortSignal): Promise<SiteConfig> {
  const payload = await requestJson('/api/v1/site', {}, signal);
  const data = unwrapData(payload);
  if (!isRecord(data)) {
    throw new ApiError('Unexpected response from /api/v1/site: "data" was not an object.', { status: 0 });
  }
  return { appearance: readAppearance(data.appearance), homepage: readHomepage(data.homepage) };
}

export const api = {
  listProducts,
  getProduct,
  listCategories: (signal?: AbortSignal): Promise<Category[]> =>
    readList('/api/v1/categories', isCategory, signal),
  listOccasions: (signal?: AbortSignal): Promise<Occasion[]> =>
    readList('/api/v1/occasions', isOccasion, signal),
  /** May legitimately be an empty array; callers must not assume otherwise. */
  listCollections: (signal?: AbortSignal): Promise<Collection[]> =>
    readList('/api/v1/collections', isCollection, signal),
  listStores: (signal?: AbortSignal): Promise<Store[]> => readList('/api/v1/stores', isStore, signal),
  listFaqs: (signal?: AbortSignal): Promise<Faq[]> => readList('/api/v1/faqs', isFaq, signal),
  getSite,
};

/* -------------------------------------------------------------------------- */
/* Assets                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Turns a catalogue image reference into something <Image> can load.
 *
 * Seeded rows may hold absolute URLs, protocol-relative URLs, data URIs or a
 * server-relative path such as "/uploads/jutti.jpg". Relative paths have to be
 * resolved against the API host, which is why this lives next to the base URL
 * instead of in a screen.
 */
export function resolveImageUrl(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (/^(https?:|data:|file:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return `${API_BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

export { apiCache } from './cache';
