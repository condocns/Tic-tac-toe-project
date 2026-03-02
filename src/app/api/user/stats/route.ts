import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
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
