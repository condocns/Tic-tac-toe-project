import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIP } from "@/lib/utils";
import { getRequiredEnv } from "@/lib/env";

export async function GET(req: NextRequest) {
  const clientIP = getClientIP(req);
  const rateLimiter = rateLimiters.general;
  const { success, limit, remaining, reset } = await rateLimiter.limit(clientIP);

  if (!success) {
    logSecurityEvent.rateLimitExceeded(req, { endpoint: "/api/user/stats", limit, remaining, reset });
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

  const token = await getToken({ req, secret: getRequiredEnv("AUTH_SECRET") });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokenEmail = typeof token.email === "string" ? token.email : undefined;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: token.sub },
          ...(tokenEmail ? [{ email: tokenEmail }] : []),
        ],
      },
      select: {
        score: true,
        wins: true,
        losses: true,
        draws: true,
        currentStreak: true,
        bestStreak: true,
        gamesPlayed: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
