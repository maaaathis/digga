type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  capacity: number;
  refillPerSecond: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

export function consumeToken(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? {
    tokens: options.capacity,
    updatedAt: now,
  };

  const elapsedSeconds = (now - bucket.updatedAt) / 1000;
  const refilled = Math.min(
    options.capacity,
    bucket.tokens + elapsedSeconds * options.refillPerSecond,
  );

  if (refilled >= 1) {
    const remaining = refilled - 1;
    buckets.set(key, { tokens: remaining, updatedAt: now });
    return { allowed: true, remaining: Math.floor(remaining), retryAfterMs: 0 };
  }

  buckets.set(key, { tokens: refilled, updatedAt: now });
  const deficit = 1 - refilled;
  const retryAfterMs = Math.ceil((deficit / options.refillPerSecond) * 1000);
  return { allowed: false, remaining: 0, retryAfterMs };
}

export function ipFromHeaders(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

const sweepInterval = 5 * 60 * 1000;
let lastSweep = 0;

export function sweepBuckets(): void {
  const now = Date.now();
  if (now - lastSweep < sweepInterval) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.updatedAt > 60 * 60 * 1000) buckets.delete(key);
  }
}
