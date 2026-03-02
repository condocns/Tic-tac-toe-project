import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIP } from "@/lib/utils";
import { redis } from "@/lib/redis";

interface GameResultRequest {
  result: "win" | "loss" | "draw";
  difficulty: "easy" | "medium" | "hard";
  moves: number[];
  duration: number;
}

export async function POST(req: NextRequest) {
  console.log("🎯 POST /api/game/result called");
  
  // Rate limiting
  const clientIP = getClientIP(req);
  const rateLimiter = rateLimiters.game;
  const { success, limit, remaining, reset } = await rateLimiter.limit(clientIP);
  
  if (!success) {
    logSecurityEvent.rateLimitExceeded(req, { 
      endpoint: "/api/game/result",
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
    console.log("❌ Unauthorized - no token");
    logSecurityEvent.unauthorizedAccess(req, { endpoint: "/api/game/result" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: GameResultRequest = await req.json();
    const { result, difficulty, moves, duration } = body;
    const tokenEmail = typeof token.email === "string" ? token.email : undefined;
    
    console.log("📊 Request data:", { result, difficulty, moves, duration, userId: token.sub });

    if (!["win", "loss", "draw"].includes(result)) {
      console.log("❌ Invalid result:", result);
      return NextResponse.json({ error: "Invalid result" }, { status: 400 });
    }

    // Calculate score change and streak in a single transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirstOrThrow({
        where: {
          OR: [
            { id: token.sub },
            ...(tokenEmail ? [{ email: tokenEmail }] : []),
          ],
        },
      });

      console.log("👤 Current user data:", { 
        score: user.score, 
        currentStreak: user.currentStreak, 
        wins: user.wins,
        losses: user.losses 
      });

      let scoreChange = 0;
      let newStreak = user.currentStreak;
      let bonusPoints = 0;

      // Update score and streak
      if (result === "win") {
        scoreChange = 1;
        newStreak += 1;

        // Check for 3-win streak bonus
        if (newStreak === 3) {
          bonusPoints = 1;
          scoreChange += bonusPoints;
          newStreak = 0; // Reset streak after bonus
        }
      } else if (result === "loss") {
        scoreChange = -1;
        newStreak = 0; // Reset streak on loss
      } else {
        // Draw - no score change, no streak change
      }

      console.log("🎮 Score calculation:", { result, scoreChange, bonusPoints, newStreak });

      // Save game record
      await tx.game.create({
        data: {
          userId: user.id,
          result: result.toUpperCase() as "WIN" | "LOSS" | "DRAW",
          difficulty: difficulty.toUpperCase() as "EASY" | "MEDIUM" | "HARD",
          moves: JSON.stringify(moves),
          duration,
        },
      });

      // Update user stats
      const updated = await tx.user.update({
        where: { id: user.id },
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

      return { ...updated, scoreChange, bonusAwarded: bonusPoints > 0 };
    });

    console.log("✅ Transaction successful:", { 
      newScore: updatedUser.score, 
      newStreak: updatedUser.currentStreak,
      scoreChange: updatedUser.scoreChange,
      bonusAwarded: updatedUser.bonusAwarded
    });

    // Clear leaderboard cache to show updated scores immediately
    if (redis) {
      try {
        const pattern = "leaderboard:*";
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
          console.log("🗑️ Cleared leaderboard cache keys:", keys.length);
        }
      } catch (error) {
        console.error("❌ Failed to clear leaderboard cache:", error);
      }
    }

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
  } catch (error) {
    console.error("❌ Failed to save game result:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
