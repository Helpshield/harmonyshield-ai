// Rate limiter utility for client-side rate limiting
// This works in conjunction with server-side rate limiting

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isRateLimited(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Filter out requests outside the time window
    const recentRequests = requests.filter(
      timestamp => now - timestamp < config.windowMs
    );
    
    // Check if rate limit is exceeded
    if (recentRequests.length >= config.maxRequests) {
      return true;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return false;
  }

  getRemainingRequests(key: string, config: RateLimitConfig): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(
      timestamp => now - timestamp < config.windowMs
    );
    
    return Math.max(0, config.maxRequests - recentRequests.length);
  }

  clear(key: string): void {
    this.requests.delete(key);
  }

  clearAll(): void {
    this.requests.clear();
  }
}

// Create singleton instance
export const rateLimiter = new RateLimiter();

// Preset configurations
export const RATE_LIMITS = {
  AI_CHAT: { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute
  URL_SCAN: { maxRequests: 20, windowMs: 60000 }, // 20 requests per minute
  FILE_UPLOAD: { maxRequests: 5, windowMs: 60000 }, // 5 uploads per minute
  SEARCH: { maxRequests: 30, windowMs: 60000 }, // 30 searches per minute
} as const;
