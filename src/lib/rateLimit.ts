/**
 * In-memory sliding window rate limiter.
 */
interface RateLimitRecord {
  timestamps: number[];
  lockUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  options: {
    maxAttempts?: number;
    windowMs?: number;
    lockoutMs?: number;
  } = {}
): { allowed: boolean; retryAfterSeconds?: number } {
  const { maxAttempts = 5, windowMs = 60 * 1000, lockoutMs = 15 * 60 * 1000 } = options;
  const now = Date.now();
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Check if currently locked out
  if (record.lockUntil && record.lockUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // Filter timestamps within window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxAttempts) {
    record.lockUntil = now + lockoutMs;
    rateLimitStore.set(key, record);
    return { allowed: false, retryAfterSeconds: Math.ceil(lockoutMs / 1000) };
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);
  return { allowed: true };
}

export function resetRateLimit(key: string) {
  rateLimitStore.delete(key);
}
