import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | null;
};

// Check if Redis environment variables are properly set
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const isTestEnv = process.env.NODE_ENV === "test";

// Fallback to mock Redis if environment variables are not set or invalid
const isRedisConfigured = redisUrl && 
  redisToken && 
  redisUrl !== "your-upstash-redis-url" && 
  redisUrl.startsWith("https://");

if (!isRedisConfigured && !isTestEnv) {
  throw new Error(
    "Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
  );
}

export const redis = isRedisConfigured
  ? (globalForRedis.redis ?? new Redis({
      url: redisUrl,
      token: redisToken,
    }))
  : null;

if (isRedisConfigured && process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export const getRequiredRedis = (): Redis => {
  if (!redis) {
    throw new Error("Redis client is not configured.");
  }
  return redis;
};

// Safe Redis operation wrapper with error handling
export async function safeRedisOperation<T>(operation: () => Promise<T>, errorMessage: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    return null;
  }
}
