import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIP } from "@/lib/utils";

export async function GET(req: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(req);
  const rateLimiter = rateLimiters.admin;
  const { success, limit, remaining, reset } = await rateLimiter.limit(clientIP);
  
  if (!success) {
    logSecurityEvent.rateLimitExceeded(req, { 
      endpoint: "/api/admin/players",
      limit,
      remaining,
      reset 
    });
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

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token?.sub) {
    logSecurityEvent.unauthorizedAccess(req, { endpoint: "/api/admin/players" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RBAC: only admin can access
  const tokenEmail = typeof token.email === "string" ? token.email : undefined;
  
  // Find actual user ID (handles provider ID vs database CUID mismatch)
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: token.sub },
        ...(tokenEmail ? [{ email: tokenEmail }] : []),
      ],
    },
    select: { role: true },
  });

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limitCount = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "score";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const orderBy: Record<string, "asc" | "desc"> = {};
    if (["score", "wins", "losses", "gamesPlayed", "createdAt"].includes(sortBy)) {
      orderBy[sortBy] = order;
    } else {
      orderBy.score = "desc";
    }

    const [players, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          score: true,
          wins: true,
          losses: true,
          draws: true,
          currentStreak: true,
          bestStreak: true,
          gamesPlayed: true,
          createdAt: true,
        },
        orderBy,
        skip: (page - 1) * limitCount,
        take: limitCount,
      }),
      prisma.user.count({ where }),
    ]);

    // Aggregate stats
    const stats = await prisma.user.aggregate({
      _sum: { gamesPlayed: true },
      _count: true,
      _avg: { score: true },
    });

    return NextResponse.json({
      players,
      pagination: { page, limit: limitCount, total, totalPages: Math.ceil(total / limitCount) },
      stats: {
        totalPlayers: stats._count,
        totalGamesPlayed: stats._sum.gamesPlayed ?? 0,
        averageScore: Math.round((stats._avg.score ?? 0) * 100) / 100,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
