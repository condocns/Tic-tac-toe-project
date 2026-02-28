import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

interface GameResultRequest {
  result: "win" | "loss" | "draw";
  difficulty: "easy" | "medium" | "hard";
  moves: number[];
  duration: number;
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: GameResultRequest = await req.json();
    const { result, difficulty, moves, duration } = body;

    if (!["win", "loss", "draw"].includes(result)) {
      return NextResponse.json({ error: "Invalid result" }, { status: 400 });
    }

    // Calculate score change and streak in a single transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: token.sub },
      });

      let scoreChange = 0;
      let newStreak = user.currentStreak;
      let bonusAwarded = false;

      if (result === "win") {
        scoreChange = 1;
        newStreak = user.currentStreak + 1;

        // Check for 3-win streak bonus
        if (newStreak >= 3) {
          scoreChange += 1; // bonus +1
          bonusAwarded = true;
          newStreak = 0; // reset streak
        }
      } else if (result === "loss") {
        scoreChange = -1;
        newStreak = 0; // reset streak on loss
      }
      // draw: no score change, keep streak

      // Save game record
      await tx.game.create({
        data: {
          userId: token.sub!,
          result: result.toUpperCase() as "WIN" | "LOSS" | "DRAW",
          difficulty: difficulty.toUpperCase() as "EASY" | "MEDIUM" | "HARD",
          moves: JSON.stringify(moves),
          duration,
        },
      });

      // Update user stats
      const updated = await tx.user.update({
        where: { id: token.sub },
        data: {
          score: { increment: scoreChange },
          currentStreak: newStreak,
          bestStreak: Math.max(user.bestStreak, newStreak),
          wins: result === "win" ? { increment: 1 } : undefined,
          losses: result === "loss" ? { increment: 1 } : undefined,
          draws: result === "draw" ? { increment: 1 } : undefined,
          gamesPlayed: { increment: 1 },
        },
      });

      return { ...updated, scoreChange, bonusAwarded };
    });

    return NextResponse.json({
      score: updatedUser.score,
      scoreChange: updatedUser.scoreChange,
      bonusAwarded: updatedUser.bonusAwarded,
      currentStreak: updatedUser.currentStreak,
      bestStreak: updatedUser.bestStreak,
      wins: updatedUser.wins,
      losses: updatedUser.losses,
      draws: updatedUser.draws,
      gamesPlayed: updatedUser.gamesPlayed,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
