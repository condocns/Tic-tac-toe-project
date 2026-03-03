import { memoryCache } from "./memory-cache";
import { redis } from "./redis";

// Fast session blacklist using memory cache + Redis fallback
export async function blacklistSession(userId: string, userEmail?: string) {
  const blacklistKey = userEmail ? `blacklist:email:${userEmail}` : `blacklist:id:${userId}`;
  console.log(`[BLACKLIST] Blacklisting session: ${blacklistKey}`);
  
  // Use memory cache for instant performance
  memoryCache.set(blacklistKey, true, 24 * 60 * 60);
  console.log(`[BLACKLIST] Set in memory cache: ${blacklistKey}`);
  
  // Also update Redis if available (for production)
  try {
    if (redis) {
      await redis.setex(blacklistKey, 24 * 60 * 60, "1");
      console.log(`[BLACKLIST] Set in Redis: ${blacklistKey}`);
    } else {
      console.log(`[BLACKLIST] Redis not available, using memory only`);
    }
  } catch (error) {
    console.error("Failed to blacklist session in Redis:", error);
  }
}

export async function isSessionBlacklisted(sessionId: string, userEmail?: string): Promise<boolean> {
  // Check by email first (more reliable for OAuth users)
  if (userEmail) {
    const emailKey = `blacklist:email:${userEmail}`;
    console.log(`[BLACKLIST] Checking email: ${emailKey}`);
    
    const emailBlacklisted = memoryCache.get<boolean>(emailKey);
    if (emailBlacklisted !== null) {
      console.log(`[BLACKLIST] Found email in memory cache: ${emailBlacklisted}`);
      return emailBlacklisted;
    }
    
    // Check Redis for email
    try {
      if (redis) {
        const result = await redis.get(emailKey);
        const isBlacklisted = String(result) === "1";
        console.log(`[BLACKLIST] Redis email result: ${result} (type: ${typeof result}), blacklisted: ${isBlacklisted}`);
        memoryCache.set(emailKey, isBlacklisted, 60);
        return isBlacklisted;
      }
    } catch (error) {
      console.error("Failed to check email blacklist in Redis:", error);
    }
  }
  
  // Fallback to session ID check
  const idKey = `blacklist:id:${sessionId}`;
  console.log(`[BLACKLIST] Checking session ID: ${idKey}`);
  
  const idBlacklisted = memoryCache.get<boolean>(idKey);
  if (idBlacklisted !== null) {
    console.log(`[BLACKLIST] Found ID in memory cache: ${idBlacklisted}`);
    return idBlacklisted;
  }
  
  // Check Redis for ID
  try {
    if (redis) {
      const result = await redis.get(idKey);
      const isBlacklisted = String(result) === "1";
      console.log(`[BLACKLIST] Redis ID result: ${result} (type: ${typeof result}), blacklisted: ${isBlacklisted}`);
      memoryCache.set(idKey, isBlacklisted, 60);
      return isBlacklisted;
    }
  } catch (error) {
    console.error("Failed to check ID blacklist in Redis:", error);
  }
  
  console.log(`[BLACKLIST] Session not blacklisted`);
  return false;
}

// Safe blacklist check with timeout to avoid long auth stalls
export async function isSessionBlacklistedSafe(sessionId: string, timeoutMs = 75, userEmail?: string): Promise<boolean> {
  try {
    return await Promise.race([
      isSessionBlacklisted(sessionId, userEmail),
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

// Clear session blacklist (for new logins)
export async function clearSessionBlacklist(userId: string, userEmail?: string | null) {
  console.log(`[BLACKLIST] Clearing session blacklist for: ${userEmail || userId}`);
  
  const emailKey = userEmail ? `blacklist:email:${userEmail}` : null;
  const idKey = `blacklist:id:${userId}`;
  
  // Clear from memory cache
  if (emailKey) {
    memoryCache.delete(emailKey);
    console.log(`[BLACKLIST] Cleared from memory cache: ${emailKey}`);
  }
  memoryCache.delete(idKey);
  console.log(`[BLACKLIST] Cleared from memory cache: ${idKey}`);
  
  // Clear from Redis
  try {
    if (redis) {
      if (emailKey) {
        await redis.del(emailKey);
        console.log(`[BLACKLIST] Cleared from Redis: ${emailKey}`);
      }
      await redis.del(idKey);
      console.log(`[BLACKLIST] Cleared from Redis: ${idKey}`);
    }
  } catch (error) {
    console.error("Failed to clear blacklist in Redis:", error);
  }
}

// Fast session check without Redis for performance
export function isSessionCached(userId: string): boolean {
  return memoryCache.get(`session:${userId}`) !== null;
}
