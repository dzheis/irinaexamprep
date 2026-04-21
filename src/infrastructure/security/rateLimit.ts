import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Upstash-backed sliding-window rate limiters.
 *
 * Fail-open design: if UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set,
 * all limiters return `{ success: true }`. This keeps the app functional (and deployable)
 * before Upstash is provisioned, and degrades gracefully if Redis is unreachable.
 *
 * Production MUST set the env vars so limiters enforce caps.
 */

export type LimiterResult = { success: boolean };

export interface AppLimiter {
  limit(key: string): Promise<LimiterResult>;
}

const ALLOW_ALL: AppLimiter = {
  async limit(): Promise<LimiterResult> {
    return { success: true };
  },
};

function isUpstashConfigured(): boolean {
  return (
    !!process.env["UPSTASH_REDIS_REST_URL"]?.trim() &&
    !!process.env["UPSTASH_REDIS_REST_TOKEN"]?.trim()
  );
}

let redisSingleton: Redis | null = null;
function getRedis(): Redis | null {
  if (!isUpstashConfigured()) return null;
  if (!redisSingleton) {
    try {
      redisSingleton = Redis.fromEnv();
    } catch (error) {
      console.warn("RateLimit: failed to init Upstash Redis, falling back to allow-all", error);
      return null;
    }
  }
  return redisSingleton;
}

type Window = Parameters<typeof Ratelimit.slidingWindow>[1];

function makeLimiter(tokens: number, window: Window, prefix: string): AppLimiter {
  const redis = getRedis();
  if (!redis) {
    if (process.env["NODE_ENV"] === "production") {
      console.warn(`RateLimit[${prefix}]: Upstash not configured; allowing all requests.`);
    }
    return ALLOW_ALL;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix,
    analytics: false,
  });

  return {
    async limit(key: string): Promise<LimiterResult> {
      try {
        const res = await limiter.limit(key);
        return { success: res.success };
      } catch (error) {
        // Never block legitimate users if Upstash has a transient failure.
        console.warn(`RateLimit[${prefix}]: limiter error, allowing request`, error);
        return { success: true };
      }
    },
  };
}

/** Payment checkout: 10 req / 1 min per (ip + userId). */
export const payLimiter: AppLimiter = makeLimiter(10, "1 m", "rl:pay");

/** Email-sending endpoints (subscribe, apply): 3 req / 1 h per IP. */
export const mailLimiter: AppLimiter = makeLimiter(3, "1 h", "rl:mail");

/** Reserved for future auth-adjacent endpoints: 10 req / 5 min per IP. */
export const authLimiter: AppLimiter = makeLimiter(10, "5 m", "rl:auth");

/** CSRF token issuance: 60 req / 1 min per IP. */
export const csrfLimiter: AppLimiter = makeLimiter(60, "1 m", "rl:csrf");

/**
 * Extract the best-effort client IP from `x-forwarded-for` (Vercel sets this).
 * Falls back to `"unknown"` so the limiter still groups un-identified callers together.
 */
export function clientIp(req: Request | { headers: Headers }): string {
  const headers = (req as { headers: Headers }).headers;
  const xff = headers.get("x-forwarded-for") ?? "";
  const first = xff.split(",")[0]?.trim();
  if (first) return first;
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

/** Convenience: returns a 429 JSON response if `limiter.limit(key)` rejects. */
export async function enforceLimit(
  limiter: AppLimiter,
  key: string,
): Promise<{ ok: true } | { ok: false; status: 429 }> {
  const res = await limiter.limit(key);
  if (!res.success) return { ok: false, status: 429 };
  return { ok: true };
}
