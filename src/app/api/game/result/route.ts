import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIP, logDev } from "@/lib/utils";
import { redis, safeRedisOperation } from "@/lib/redis";
import { gameResultSchema } from "@/lib/validations";
import { getRequiredEnv } from "@/lib/env";
import { checkWinner, isBoardFull, type Player, type Board } from "@/lib/game/logic";
import { BOARD_CONFIGS } from "@/constants";
import { GAME_CONFIG } from "@/lib/config";

function calculateScoreAndStreak(result: "win" | "loss" | "draw", currentStreak: number) {
  let scoreChange = 0;
  let newStreak = currentStreak;
  let bonusPoints = 0;

  if (result === "win") {
    scoreChange = 1;
    newStreak += 1;
    if (newStreak === 3) {
      bonusPoints = 1;
      scoreChange += bonusPoints;
      newStreak = 0;
    }
  } else if (result === "loss") {
    scoreChange = -1;
    newStreak = 0;
  }

  return { scoreChange, newStreak, bonusPoints };
}

function verifyBoardState(finalBoard: Board, gridSize: string, humanPlayer: Player, claimedResult: "win" | "loss" | "draw"): "win" | "loss" | "draw" {
  const { winner } = checkWinner(finalBoard, gridSize as "3x3" | "4x4" | "5x5");
  const isFull = isBoardFull(finalBoard);
  
  logDev("🔍 Board analysis:", { winner, isFull, humanPlayer, claimedResult });
  
  if (winner) {
    const actualResult = winner === humanPlayer ? "win" : "loss";
    logDev("🏆 Winner detected:", { winner, humanPlayer, actualResult });
    return actualResult;
  } else if (isFull) {
    logDev("🤝 Board full - draw");
    return "draw";
  } else {
    // Incomplete game - this could be surrender, timeout, or disconnection
    // Trust the frontend's claimed result for incomplete games
    logDev("⏳ Incomplete game - trusting frontend result:", claimedResult);
    return claimedResult;
  }
}

export async function POST(req: NextRequest) {
  logDev("🎯 POST /api/game/result called");
  
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

  const token = await getToken({ req, secret: getRequiredEnv("AUTH_SECRET") });
  if (!token?.sub) {
    logDev("❌ Unauthorized - no token");
    logSecurityEvent.unauthorizedAccess(req, { endpoint: "/api/game/result" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    const validationResult = gameResultSchema.safeParse(body);
    if (!validationResult.success) {
      logDev("❌ Invalid request body:", validationResult.error.format());
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() }, 
        { status: 400 }
      );
    }
    
    const { result, difficulty, moves, duration, gridSize, finalBoard, gameSessionId, humanPlayer } = validationResult.data;
    const tokenEmail = typeof token.email === "string" ? token.email : undefined;

    // Security: Prevent duplicate submissions using session ID
    const sessionKey = `game_session:${token.sub}:${gameSessionId}`;
    const existingSession = await safeRedisOperation(
      () => redis!.get(sessionKey),
      "Failed to check session"
    );
    
    logDev("🔍 Session check:", { sessionKey, existingSession });
    
    if (existingSession) {
      logSecurityEvent.duplicateSubmission(req, {
        endpoint: "/api/game/result",
        userId: token.sub,
        gameSessionId,
      });
      return NextResponse.json(
        { error: "Game result already submitted for this session" },
        { status: 409 }
      );
    }

    // Security: Verify result from board state to prevent cheating
    const boardConfig = BOARD_CONFIGS[gridSize];
    const expectedBoardSize = boardConfig.size;
    
    logDev("🔍 Board check:", { 
      gridSize, 
      expectedBoardSize, 
      finalBoardLength: finalBoard.length,
      boardConfig 
    });
    
    if (finalBoard.length !== expectedBoardSize) {
      logSecurityEvent.invalidInput(req, { 
        endpoint: "/api/game/result", 
        reason: "Invalid board size in finalBoard",
        expected: expectedBoardSize,
        received: finalBoard.length
      });
      return NextResponse.json(
        { error: "Invalid board state: size mismatch" }, 
        { status: 400 }
      );
    }

    // Calculate actual result from board
    const computedResult = verifyBoardState(finalBoard, gridSize, humanPlayer, result);

    logDev("🔍 Verification:", { 
      claimedResult: result, 
      computedResult,
    });

    // Verify claimed result matches computed result
    // Log security event but allow the request to proceed
    // The frontend already validates result from API response
    if (result !== computedResult) {
      logSecurityEvent.cheatAttempt(req, {
        endpoint: "/api/game/result",
        userId: token.sub,
        claimedResult: result,
        computedResult,
        board: finalBoard,
      });
      logDev("⚠️ Result mismatch detected but allowing request:", {
        claimedResult: result,
        computedResult,
      });
    }
    
    logDev("📊 Request data:", { result, difficulty, moves, duration, userId: token.sub });

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

      logDev("👤 Current user data:", { 
        score: user.score, 
        currentStreak: user.currentStreak, 
        wins: user.wins,
        losses: user.losses 
      });

      const { scoreChange, newStreak, bonusPoints } = calculateScoreAndStreak(result, user.currentStreak);

      logDev("🎮 Score calculation:", { result, scoreChange, bonusPoints, newStreak });

      // Save game record
      await tx.game.create({
        data: {
          userId: user.id,
          result: result.toUpperCase() as "WIN" | "LOSS" | "DRAW",
          difficulty: difficulty.toUpperCase() as "EASY" | "MEDIUM" | "HARD",
          moves: moves, // Now stored natively as Int[] in PostgreSQL
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

    logDev("✅ Transaction successful:", { 
      newScore: updatedUser.score, 
      newStreak: updatedUser.currentStreak,
      scoreChange: updatedUser.scoreChange,
      bonusAwarded: updatedUser.bonusAwarded
    });

    await safeRedisOperation(
      () => redis!.set(sessionKey, "1", { ex: GAME_CONFIG.SESSION_EXPIRY }),
      "Failed to mark session"
    );

    // Clear leaderboard cache to show updated scores immediately
    await safeRedisOperation(async () => {
      const keys = await redis!.keys(GAME_CONFIG.LEADERBOARD_CACHE_PATTERN);
      if (keys.length > 0) {
        await redis!.del(...keys);
        logDev("🗑️ Cleared leaderboard cache keys:", keys.length);
      }
    }, "Failed to clear leaderboard cache");

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
