import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Singleton pattern for Redis connection (SOLID: Single Responsibility)
class RedisClient {
  private static instance: Redis | null = null;

  static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    }
    return this.instance;
  }
}

// Rate limiters for different endpoints (DRY: Centralized configuration)
export const rateLimiters = {
  // Game endpoints: 10 requests per 10 seconds
  game: new Ratelimit({
    redis: RedisClient.getInstance(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
  }),
  
  // Auth endpoints: 5 requests per minute  
  auth: new Ratelimit({
    redis: RedisClient.getInstance(),
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
  }),
  
  // Admin endpoints: 60 requests per minute (more user-friendly for UI operations)
  admin: new Ratelimit({
    redis: RedisClient.getInstance(),
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    analytics: true,
  }),
  
  // General API: 100 requests per minute
  general: new Ratelimit({
    redis: RedisClient.getInstance(),
    limiter: Ratelimit.slidingWindow(100, "60 s"),
    analytics: true,
  }),
} as const;

// Type-safe rate limiter keys
export type RateLimiterKey = keyof typeof rateLimiters;

// Helper function to get appropriate rate limiter based on route
export function getRateLimiterForRoute(pathname: string): RateLimiterKey {
  if (pathname.startsWith('/api/game')) return 'game';
  if (pathname.startsWith('/api/auth')) return 'auth';
  if (pathname.startsWith('/api/admin')) return 'admin';
  return 'general';
}
