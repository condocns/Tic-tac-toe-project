import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { rateLimiters } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIP } from "@/lib/utils";
import { leaderboardQuerySchema } from "@/lib/validations";

const CACHE_KEY = "leaderboard";
const CACHE_TTL = 10; // 10 seconds - faster updates

export async function GET(req: NextRequest) {
  const clientIP = getClientIP(req);
  const rateLimiter = rateLimiters.general;
  const { success, limit: rateLimit, remaining, reset } = await rateLimiter.limit(clientIP);

  if (!success) {
    logSecurityEvent.rateLimitExceeded(req, { endpoint: "/api/leaderboard", limit: rateLimit, remaining, reset });
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  const validationResult = leaderboardQuerySchema.safeParse(queryParams);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: validationResult.error.format() },
      { status: 400 }
    );
  }

  const { page, limit, search } = validationResult.data;

  try {
    const cacheKey = `${CACHE_KEY}:${page}:${limit}:${search}`;

    // Try cache first (only if Redis is configured)
    const cached = redis ? await redis.get(cacheKey).catch(() => null) : null;
    if (cached) {
      try {
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        return NextResponse.json(parsed);
      } catch {
        // Ignore cache parse errors and fall back to DB
      }
    }

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          image: true,
          score: true,
          wins: true,
          losses: true,
          draws: true,
          bestStreak: true,
          gamesPlayed: true,
        },
        orderBy: { score: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const result = {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache result (only if Redis is configured)
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL }).catch(() => {});
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
