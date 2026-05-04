import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "@/lib/constants";

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

function pruneIfNeeded() {
  if (buckets.size > 5000) {
    const now = Date.now();
    for (const [key, b] of buckets) {
      if (now - b.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
        buckets.delete(key);
      }
    }
  }
}

/**
 * シンプルな固定ウィンドウ方式のレート制限（サーバーレスではプロセス内のみ有効）。
 */
export function checkRateLimit(key: string): {
  ok: boolean;
  retryAfterSec?: number;
} {
  pruneIfNeeded();
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    bucket = { count: 1, windowStart: now };
    buckets.set(key, bucket);
    return { ok: true };
  }

  if (bucket.count >= RATE_LIMIT_MAX) {
    const retryAfterMs =
      RATE_LIMIT_WINDOW_MS - (now - bucket.windowStart);
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
