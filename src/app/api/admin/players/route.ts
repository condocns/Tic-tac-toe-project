import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIP } from "@/lib/utils";
import { adminQuerySchema } from "@/lib/validations";
import { Prisma, UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  // 1. Rate limiting
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

  try {
    // 2. Authentication
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token?.sub) {
      logSecurityEvent.unauthorizedAccess(req, { endpoint: "/api/admin/players" });
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 3. RBAC (Role-Based Access Control)
    const tokenEmail = typeof token.email === "string" ? token.email : undefined;
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: token.sub },
          ...(tokenEmail ? [{ email: tokenEmail }] : []),
        ],
      },
      select: { role: true },
    });

    if (user?.role !== UserRole.ADMIN) {
      logSecurityEvent.unauthorizedAccess(req, { 
        endpoint: "/api/admin/players", 
        userId: token.sub,
        reason: "Insufficient permissions" 
      });
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 4. Input Validation
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validationResult = adminQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { page, limit: limitCount, search, adminOnly, sortBy, order } = validationResult.data;

    // 5. Build Type-Safe Query Options
    const whereCondition: Prisma.UserWhereInput = {};
    
    // Handle role filter
    if (adminOnly === "true") {
      whereCondition.role = UserRole.ADMIN;
    }
    
    // Handle search text
    if (search) {
      const searchFilter: Prisma.UserWhereInput = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
      
      if (adminOnly === "true") {
        whereCondition.AND = [searchFilter];
      } else {
        // If no adminOnly filter, just use the search filter directly
        Object.assign(whereCondition, searchFilter);
      }
    }

    // Type-safe ordering
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: order
    };

    // 6. Database Operations (Concurrent)
    const [players, total, stats] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
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
      prisma.user.count({ where: whereCondition }),
      prisma.user.aggregate({
        _sum: { gamesPlayed: true },
        _count: true,
        _avg: { score: true },
      })
    ]);

    // 7. Structured Response
    return NextResponse.json({
      players,
      pagination: { 
        page, 
        limit: limitCount, 
        total, 
        totalPages: Math.ceil(total / limitCount) 
      },
      stats: {
        totalPlayers: stats._count,
        totalGamesPlayed: stats._sum.gamesPlayed ?? 0,
        averageScore: Math.round((stats._avg.score ?? 0) * 100) / 100,
      },
    });

  } catch (error) {
    // 8. Robust Error Handling
    console.error("[Admin API Error]:", error);
    
    // Check if it's a Prisma error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database operation failed" }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
