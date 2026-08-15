import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter for ticket purchases
// 5 attempts per 15 minutes per IP
export const purchaseLimiter = new RateLimiterMemory({
  points: 5,
  duration: 900, // 15 minutes
  keyPrefix: 'purchase',
});

// Rate limiter for API verification
// 20 attempts per minute per IP
export const verifyLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
  keyPrefix: 'verify',
});

// Rate limiter for scanner
// 100 scans per minute per IP (high for event scanning)
export const scanLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
  keyPrefix: 'scan',
});

// Rate limiter for general API
// 30 requests per minute per IP
export const apiLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
  keyPrefix: 'api',
});

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function checkRateLimit(
  limiter: RateLimiterMemory,
  request: Request
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const ip = getClientIP(request);
  try {
    await limiter.consume(ip);
    return { allowed: true };
  } catch (rateLimiterRes) {
    return {
      allowed: false,
      retryAfter: Math.round((rateLimiterRes as any).msBeforeNext / 1000),
    };
  }
}
