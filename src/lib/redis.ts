import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | null;
};

// Check if Redis environment variables are properly set
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Fallback to mock Redis if environment variables are not set or invalid
const isRedisConfigured = redisUrl && 
  redisToken && 
  redisUrl !== "your-upstash-redis-url" && 
  redisUrl.startsWith("https://");

export const redis = isRedisConfigured
  ? (globalForRedis.redis ?? new Redis({
      url: redisUrl,
      token: redisToken,
    }))
  : null;

if (isRedisConfigured && process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
