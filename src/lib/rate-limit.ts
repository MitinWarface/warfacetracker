// src/lib/rate-limit.ts
// Redis sliding-window rate limiter

import { redis } from "./redis";

const MAX     = Number(process.env.RATE_LIMIT_MAX)    || 10;
const WINDOW  = Number(process.env.RATE_LIMIT_WINDOW) || 60; // seconds

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   number; // unix seconds
}

/**
 * Check rate limit for an identifier (IP or user ID).
 * Uses a Redis sorted-set sliding window.
 */
export async function checkRateLimit(
  identifier: string,
  max    = MAX,
  window = WINDOW
): Promise<RateLimitResult> {
  const key = `rl:${identifier}`;
  const now = Date.now();
  const windowStart = now - window * 1000;

  try {
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, "-inf", windowStart); // prune old entries
    pipeline.zadd(key, now, `${now}-${Math.random()}`); // record this request
    pipeline.zcard(key);                                 // count in window
    pipeline.expire(key, window);                        // auto-clean

    const results = await pipeline.exec();
    const count = (results?.[2]?.[1] as number) ?? 0;

    return {
      allowed:   count <= max,
      remaining: Math.max(0, max - count),
      resetAt:   Math.ceil((now + window * 1000) / 1000),
    };
  } catch {
    // Redis unavailable — fail open
    return { allowed: true, remaining: max, resetAt: 0 };
  }
}

/**
 * Extract the real IP from Next.js request headers (handles proxies).
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
