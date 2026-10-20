// In-memory cache for API proxy
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

// Global cache storage preserved across hot reloads in development
const globalCache = globalThis as unknown as {
  __discogs_cache?: Map<string, CacheEntry<any>>;
};

if (!globalCache.__discogs_cache) {
  globalCache.__discogs_cache = new Map<string, CacheEntry<any>>();
}

export const proxyCache = {
  get<T>(key: string): { data: T; timestamp: number } | null {
    const entry = globalCache.__discogs_cache?.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
    if (isExpired) {
      globalCache.__discogs_cache?.delete(key);
      return null;
    }

    return {
      data: entry.data as T,
      timestamp: entry.timestamp,
    };
  },

  set<T>(key: string, data: T, ttlHours = 24): void {
    const ttlMs = ttlHours * 60 * 60 * 1000;
    globalCache.__discogs_cache?.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
    });
  },

  clear(): void {
    globalCache.__discogs_cache?.clear();
  },

  size(): number {
    return globalCache.__discogs_cache?.size ?? 0;
  },

  stats(): { totalEntries: number; keys: string[] } {
    const keys = Array.from(globalCache.__discogs_cache?.keys() ?? []);
    return {
      totalEntries: keys.length,
      keys: keys.slice(0, 50),
    };
  }
};
