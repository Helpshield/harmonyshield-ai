// Server-side rate limiter for Edge Functions
// Uses in-memory storage - consider Redis for production

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class EdgeRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: number | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.startCleanup();
  }

  private startCleanup() {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.resetAt) {
          this.store.delete(key);
        }
      }
    }, 300000) as unknown as number;
  }

  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // No entry or expired entry - create new
    if (!entry || now > entry.resetAt) {
      const resetAt = now + windowMs;
      this.store.set(identifier, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    // Entry exists and not expired
    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }
}

// Create singleton
const rateLimiter = new EdgeRateLimiter();

// Rate limit configurations
export const RATE_LIMIT_CONFIG = {
  AI_CHAT: { limit: 20, windowMs: 60000 }, // 20 requests per minute
  URL_SCAN: { limit: 30, windowMs: 60000 }, // 30 requests per minute
  FILE_UPLOAD: { limit: 10, windowMs: 60000 }, // 10 uploads per minute
  SEARCH: { limit: 50, windowMs: 60000 }, // 50 searches per minute
  DEFAULT: { limit: 100, windowMs: 60000 }, // 100 requests per minute
} as const;

// Helper function to check rate limit
export function checkRateLimit(
  identifier: string,
  configKey: keyof typeof RATE_LIMIT_CONFIG = 'DEFAULT'
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = RATE_LIMIT_CONFIG[configKey];
  return rateLimiter.check(identifier, config.limit, config.windowMs);
}

// Helper to get identifier from request (IP or user ID)
export function getRateLimitIdentifier(req: Request, userId?: string): string {
  if (userId) return `user:${userId}`;
  
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`;
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }
  
  // Fallback to a generic identifier
  return 'anonymous';
}

// Helper to create rate limit error response
export function createRateLimitResponse(resetAt: number, corsHeaders: Record<string, string>) {
  const resetIn = Math.ceil((resetAt - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${resetIn} seconds.`,
      retryAfter: resetIn,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': resetIn.toString(),
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
      },
    }
  );
}
