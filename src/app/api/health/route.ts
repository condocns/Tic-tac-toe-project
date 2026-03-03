import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIP } from "@/lib/utils";
import { getToken } from "next-auth/jwt";
import { getRequiredEnv } from "@/lib/env";
import { isSessionBlacklistedSafe } from "@/lib/session-blacklist";

export async function GET(req: NextRequest) {
  const clientIP = getClientIP(req);
  const { success, limit, remaining, reset } = await rateLimiters.general.limit(`health_${clientIP}`);
  if (!success) {
    logSecurityEvent.rateLimitExceeded(req, { endpoint: "/api/health", limit, remaining, reset });
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  try {
    // Check session validity
    const token = await getToken({ req, secret: getRequiredEnv("AUTH_SECRET") });
    
    if (token?.sub) {
      const isBlacklisted = await isSessionBlacklistedSafe(token.sub, 75, token.email || undefined);
      if (isBlacklisted) {
        return NextResponse.json(
          { error: "Session revoked" },
          { status: 401 }
        );
      }
    }

    const start = Date.now();

    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - start;

      return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        checks: {
          database: { status: "ok", latency: dbLatency },
        },
      });
    } catch (dbError) {
      return NextResponse.json(
        {
          status: "error",
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: "error" },
          },
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("[Health API Error]:", error);
    return NextResponse.json(
      { error: "Health check failed" },
      { status: 500 }
    );
  }
}
