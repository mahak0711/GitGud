// Simple in-memory cache with TTL. Not suitable for multi-instance production.
type CacheEntry<T> = { value: T; expiresAt: number };

const cache = new Map<string, CacheEntry<any>>();
const CLEANUP_INTERVAL = 60_000; // 60s

function nowMs() { return Date.now(); }

export function setCache<T>(key: string, value: T, ttlSeconds = 3600) {
  const entry: CacheEntry<T> = { value, expiresAt: nowMs() + ttlSeconds * 1000 };
  cache.set(key, entry);
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < nowMs()) { cache.delete(key); return null; }
  return entry.value as T;
}

// Periodic cleanup to avoid memory leaks in long-running dev servers
setInterval(() => {
  const now = nowMs();
  for (const [k, v] of cache.entries()) {
    if (v.expiresAt < now) cache.delete(k);
  }
}, CLEANUP_INTERVAL).unref?.();

export function clearCache() { cache.clear(); }

export default { getCache, setCache, clearCache };
