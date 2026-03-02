import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));

  try {
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
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
