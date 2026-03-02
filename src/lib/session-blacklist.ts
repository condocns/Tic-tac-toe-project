import { memoryCache } from "./memory-cache";
import { redis } from "./redis";

// Fast session blacklist using memory cache + Redis fallback
export async function blacklistSession(sessionId: string) {
  // Use memory cache for instant performance
  memoryCache.set(`blacklist:${sessionId}`, true, 24 * 60 * 60);
  
  // Also update Redis if available (for production)
  try {
    if (redis) {
      await redis.setex(`blacklist:${sessionId}`, 24 * 60 * 60, "1");
    }
  } catch (error) {
    console.error("Failed to blacklist session in Redis:", error);
  }
}

export async function isSessionBlacklisted(sessionId: string): Promise<boolean> {
  // Check memory cache first (instant)
  const blacklisted = memoryCache.get<boolean>(`blacklist:${sessionId}`);
  if (blacklisted !== null) return blacklisted;
  
  // Fallback to Redis
  try {
    if (redis) {
      const result = await redis.get(`blacklist:${sessionId}`);
      const isBlacklisted = result === "1";
      // Cache the result in memory
      memoryCache.set(`blacklist:${sessionId}`, isBlacklisted, 60);
      return isBlacklisted;
    }
  } catch (error) {
    console.error("Failed to check blacklist in Redis:", error);
  }
  
  return false;
}

// Safe blacklist check with timeout to avoid long auth stalls
export async function isSessionBlacklistedSafe(sessionId: string, timeoutMs = 75): Promise<boolean> {
  try {
    return await Promise.race([
      isSessionBlacklisted(sessionId),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
    ]);
  } catch {
    return false;
  }
}

// Session cache for performance - Memory first, Redis fallback
export async function cacheSession(userId: string, sessionData: any) {
  // Use memory cache for instant performance (primary)
  memoryCache.set(`session:${userId}`, sessionData, 5 * 60);
  
  // Update Redis asynchronously (non-blocking)
  if (redis) {
    try {
      const jsonString = JSON.stringify(sessionData);
      redis.setex(`session:${userId}`, 5 * 60, jsonString).catch((error) => {
        console.error("Redis cache error:", error);
      });
    } catch (error) {
      console.error("JSON stringify error:", error);
    }
  }
}

export async function getCachedSession(userId: string) {
  // Check memory cache first (instant - 0ms)
  const cached = memoryCache.get(`session:${userId}`);
  if (cached) return cached;
  
  // Fallback to Redis only if memory cache miss
  if (redis) {
    try {
      const redisCached = await redis.get(`session:${userId}`);
      if (redisCached && typeof redisCached === 'string') {
        try {
          const session = JSON.parse(redisCached);
          // Cache in memory for next instant access (longer TTL for frequently accessed)
          memoryCache.set(`session:${userId}`, session, 10 * 60); // 10 minutes
          return session;
        } catch (parseError) {
          console.error("JSON parse error, clearing Redis cache:", parseError);
          // Clear invalid Redis data
          redis.del(`session:${userId}`).catch(() => {});
        }
      }
    } catch (error) {
      console.error("Redis error, using memory cache only:", error);
    }
  }
  
  return null;
}

// Fast session check without Redis for performance
export function isSessionCached(userId: string): boolean {
  return memoryCache.get(`session:${userId}`) !== null;
}
