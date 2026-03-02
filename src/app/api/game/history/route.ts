import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { historyQuerySchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { rateLimiters } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIP } from "@/lib/utils";
import { getRequiredEnv } from "@/lib/env";

export async function GET(req: NextRequest) {
  const clientIP = getClientIP(req);
  const { success, limit, remaining, reset } = await rateLimiters.general.limit(clientIP);

  if (!success) {
    logSecurityEvent.rateLimitExceeded(req, { endpoint: "/api/game/history", limit, remaining, reset });
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
    logSecurityEvent.unauthorizedAccess(req, { endpoint: "/api/game/history" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Input Validation using centralized Zod schema
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validationResult = historyQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { page, limit } = validationResult.data;

    const tokenEmail = typeof token.email === "string" ? token.email : undefined;
    
    // Find actual user ID (handles provider ID vs database CUID mismatch)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: token.sub },
          ...(tokenEmail ? [{ email: tokenEmail }] : []),
        ],
      },
    });

    if (!user) {
      return NextResponse.json({
        games: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.game.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[History API Error]:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Database operation failed" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
