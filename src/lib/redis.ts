// src/lib/redis.ts
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis;
  memCache: Map<string, { value: string; expires: number }>;
};

function createRedis() {
  const client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    connectTimeout: 2000,
  });

  client.on("error", () => {
    // Silently degrade to in-memory cache
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedis();

// Track Redis availability so we skip it when it's known to be down
let redisAvailable = true;
redis.on("error", () => { redisAvailable = false; });
redis.on("connect", () => { redisAvailable = true; });

// In-memory fallback cache (survives between requests in the same process)
const memCache: Map<string, { value: string; expires: number }> =
  globalForRedis.memCache ?? new Map();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis    = redis;
  globalForRedis.memCache = memCache;
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

export async function getCache<T>(key: string): Promise<T | null> {
  // 1. In-memory (fastest)
  const mem = memCache.get(key);
  if (mem) {
    if (Date.now() < mem.expires) return JSON.parse(mem.value) as T;
    memCache.delete(key);
  }

  // 2. Redis (if available)
  if (redisAvailable) {
    try {
      const raw = await redis.get(key);
      if (raw) {
        // Warm the in-memory layer so next hit is instant
        const ttlSec = await redis.ttl(key);
        if (ttlSec > 0) {
          memCache.set(key, { value: raw, expires: Date.now() + ttlSec * 1000 });
        }
        return JSON.parse(raw) as T;
      }
    } catch {
      redisAvailable = false;
    }
  }

  return null;
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const serialized = JSON.stringify(value);
  const expires    = Date.now() + ttlSeconds * 1000;

  // Always write to in-memory
  memCache.set(key, { value: serialized, expires });

  // Best-effort Redis write
  if (redisAvailable) {
    try {
      await redis.set(key, serialized, "EX", ttlSeconds);
    } catch {
      redisAvailable = false;
    }
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  // Clear matching keys from in-memory cache
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  for (const k of memCache.keys()) {
    if (regex.test(k)) memCache.delete(k);
  }

  // Best-effort Redis invalidation
  if (redisAvailable) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) await redis.del(...keys);
    } catch {
      redisAvailable = false;
    }
  }
}
