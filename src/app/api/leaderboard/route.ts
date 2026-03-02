import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const CACHE_KEY = "leaderboard";
const CACHE_TTL = 10; // 10 seconds - faster updates

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const search = searchParams.get("search") || "";

  try {
    const cacheKey = `${CACHE_KEY}:${page}:${limit}:${search}`;

    // Try cache first (only if Redis is configured)
    const cached = redis ? await redis.get(cacheKey).catch(() => null) : null;
    if (cached) {
      return NextResponse.json(cached);
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
