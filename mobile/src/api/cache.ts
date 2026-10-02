/**
 * Offline response cache for the public API client.
 *
 * Two layers, one always active and one pluggable:
 *   1. `memoryStore`  — in-memory Map, TTL bounded, cleared on app restart.
 *                       ALWAYS WORKS, zero dependencies, zero config.
 *   2. `storageBackend` — pluggable KV that persists across app restarts.
 *                       Pass `AsyncStorageBackend` once @react-native-async-storage/async-storage
 *                       is installed (see the commented adapter at the bottom).
 *
 * Stale-while-revalidate semantics:
 *   - Cache hit   : the cached payload is returned synchronously/from storage;
 *                   the caller also runs the live request and, if it succeeds,
 *                   the cache entry is refreshed. The caller decides whether to
 *                   surface the updated value (hooks.ts typically renders the
 *                   first arrival and lets a reload replace it).
 *   - Cache miss  : nothing is returned from cache; the live request runs and
 *                   the response is written on success.
 *   - Network error + cached payload : the cached payload is the answer so a
 *                   screen with no network still renders content.
 *
 * TTLs are deliberately generous because the server itself marks responses with
 * Cache-Control: public, max-age=60. The cache here is a second layer that adds
 * OFFLINE reading, not a replacement for HTTP freshness.
 */

export type CacheEntry = {
  /** Serialised JSON payload of the response body. */
  body: string;
  /** ms since epoch. Entries older than TTL are treated as stale (still served
   *  offline, but a live fetch is always triggered in parallel). */
  writtenAt: number;
  /** The status we would have returned (200). All non-2xx responses skip the
   *  cache entirely so a transient 429 or 500 is never replayed. */
  status: number;
};

export const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const CACHE_MAX_ENTRIES = 128;

/**
 * Pluggable durable storage back-end.
 *
 * Implement this to persist cache entries across app restarts. The default
 * `NullStorageBackend` keeps nothing; the in-memory layer is still active.
 *
 * NOTE: the concrete values are already JSON strings. Serialising twice would
 * be wasteful but harmless; the adapter treats `body` as an opaque blob.
 */
export interface StorageBackend {
  get(key: string): Promise<CacheEntry | null>;
  set(key: string, entry: CacheEntry): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/** Default backend: persists nothing (offline = only the memory layer). */
export class NullStorageBackend implements StorageBackend {
  async get(_key: string): Promise<CacheEntry | null> {
    return null;
  }
  async set(_key: string, _entry: CacheEntry): Promise<void> {}
  async remove(_key: string): Promise<void> {}
  async clear(): Promise<void> {}
}

/**
 * Memory store. One per app lifetime (instantiated in the module-scope cache
 * below so every call shares the same map). Size bounded via LRU-ish eviction
 * of the oldest-written entries once the cap is hit.
 */
class MemoryStore {
  private readonly map = new Map<string, CacheEntry>();

  get(key: string): CacheEntry | null {
    return this.map.get(key) ?? null;
  }

  set(key: string, entry: CacheEntry): void {
    if (this.map.size >= CACHE_MAX_ENTRIES && !this.map.has(key)) {
      const oldestKeys = [...this.map.entries()]
        .sort((a, b) => a[1].writtenAt - b[1].writtenAt)
        .slice(0, Math.ceil(CACHE_MAX_ENTRIES / 4))
        .map(([k]) => k);
      for (const k of oldestKeys) this.map.delete(k);
    }
    this.map.set(key, entry);
  }

  remove(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

function isFresh(entry: CacheEntry, now: number = Date.now()): boolean {
  return now - entry.writtenAt <= CACHE_TTL_MS;
}

export class ApiCache {
  private readonly memory = new MemoryStore();

  constructor(private readonly storage: StorageBackend = new NullStorageBackend()) {}

  /**
   * Read: first the memory store, then (on miss) the durable storage.
   * Storage reads that succeed are promoted back into memory so the next
   * lookup for the same key is synchronous.
   */
  async read(key: string): Promise<{ entry: CacheEntry | null; fresh: boolean }> {
    const fromMemory = this.memory.get(key);
    if (fromMemory !== null) {
      return { entry: fromMemory, fresh: isFresh(fromMemory) };
    }

    let fromStorage: CacheEntry | null = null;
    try {
      fromStorage = await this.storage.get(key);
    } catch {
      fromStorage = null;
    }

    if (fromStorage !== null) {
      this.memory.set(key, fromStorage);
      return { entry: fromStorage, fresh: isFresh(fromStorage) };
    }

    return { entry: null, fresh: false };
  }

  /**
   * Write: memory synchronously, durable storage asynchronously.
   * Storage write failures are swallowed so a broken storage adapter never
   * breaks the network path.
   */
  async write(key: string, body: unknown, status: number = 200): Promise<void> {
    const entry: CacheEntry = {
      body: JSON.stringify(body),
      writtenAt: Date.now(),
      status,
    };
    this.memory.set(key, entry);
    try {
      await this.storage.set(key, entry);
    } catch {
      // Durable layer is best-effort.
    }
  }

  async invalidate(key: string): Promise<void> {
    this.memory.remove(key);
    try {
      await this.storage.remove(key);
    } catch {
      // best effort
    }
  }

  async clearAll(): Promise<void> {
    this.memory.clear();
    try {
      await this.storage.clear();
    } catch {
      // best effort
    }
  }

  /** Parses an entry's cached JSON body back into the response shape. */
  parseBody<T>(entry: CacheEntry): T | null {
    try {
      return JSON.parse(entry.body) as T;
    } catch {
      return null;
    }
  }
}

/** Module-scope singleton shared by every request in client.ts. */
export const apiCache = new ApiCache();

/**
 * Build the canonical cache key from an API path + the normalised query-string.
 * Query values are already percent-encoded in the output of buildUrl(), so
 * `?q=Red+Jutti` and `?q=Red%20Jutti` would be different keys — which is the
 * correct behaviour because two different URLs are two different requests.
 */
export function buildCacheKey(path: string, queryString: string): string {
  return queryString.length > 0 ? `${path}?${queryString}` : path;
}

/* -------------------------------------------------------------------------- */
/*                 AsyncStorageBackend — requires package install             */
/* -------------------------------------------------------------------------- */
/*
 * WHEN YOU INSTALL @react-native-async-storage/async-storage:
 *
 *   1. `npx expo install @react-native-async-storage/async-storage`
 *   2. Uncomment the block below.
 *   3. In client.ts, change:
 *        export const apiCache = new ApiCache();
 *      to:
 *        import { AsyncStorageBackend } from './cache';
 *        export const apiCache = new ApiCache(new AsyncStorageBackend());
 *
 * That is the complete integration: the memory layer keeps hot reads fast,
 * and the AsyncStorageBackend makes cached entries survive an app restart,
 * which is what turns "no network at all" into "renders the last-seen data".
 *
 * ------------------------------------------------------------------------

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = '@ff_api_cache/v1/';

export class AsyncStorageBackend implements StorageBackend {
  private static keyOf(k: string): string {
    // Collision-safe: encodeURIComponent turns any '/' or '?' inside the cache
    // key into safe characters that AsyncStorage's flat KV can accept.
    return `${STORAGE_KEY_PREFIX}${encodeURIComponent(k)}`;
  }

  async get(key: string): Promise<CacheEntry | null> {
    try {
      const raw = await AsyncStorage.getItem(AsyncStorageBackend.keyOf(key));
      if (raw === null) return null;
      const parsed = JSON.parse(raw) as { body: string; writtenAt: number; status: number };
      if (
        typeof parsed.body !== 'string' ||
        typeof parsed.writtenAt !== 'number' ||
        typeof parsed.status !== 'number'
      ) {
        await this.remove(key);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  async set(key: string, entry: CacheEntry): Promise<void> {
    await AsyncStorage.setItem(
      AsyncStorageBackend.keyOf(key),
      JSON.stringify({ body: entry.body, writtenAt: entry.writtenAt, status: entry.status })
    );
  }

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(AsyncStorageBackend.keyOf(key));
  }

  async clear(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(STORAGE_KEY_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  }
}
*/
