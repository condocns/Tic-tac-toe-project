import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAIMove } from "@/lib/game/ai";
import { checkWinner, isBoardFull, getGameResult, type Board, type Difficulty, type Player } from "@/lib/game/logic";
import { getBotMessage } from "@/lib/game/bot-messages";
import { BOARD_CONFIGS } from "@/constants";
import { rateLimiters } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIP } from "@/lib/utils";
import { gameMoveSchema } from "@/lib/validations";
import { getRequiredEnv } from "@/lib/env";

export async function POST(req: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(req);
  const rateLimiter = rateLimiters.game;
  const { success, limit, remaining, reset } = await rateLimiter.limit(clientIP);
  
  if (!success) {
    logSecurityEvent.rateLimitExceeded(req, { 
      endpoint: "/api/game/move",
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
    logSecurityEvent.unauthorizedAccess(req, { endpoint: "/api/game/move" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validationResult = gameMoveSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { cellIndex, gridSize, difficulty, humanPlayer, aiPlayer } = validationResult.data;

    // Get the actual board size based on grid configuration
    const boardSize = BOARD_CONFIGS[gridSize].size;
    const board: Board = validationResult.data.board
      ? [...validationResult.data.board]
      : Array(boardSize).fill(null);

    if (board.length !== boardSize) {
      return NextResponse.json({ error: "Invalid board size" }, { status: 400 });
    }

    // Validate move
    if (cellIndex < 0 || cellIndex >= boardSize || board[cellIndex] !== null) {
      return NextResponse.json({ error: "Invalid move" }, { status: 400 });
    }

    // Apply player move
    const boardAfterPlayer = [...board];
    boardAfterPlayer[cellIndex] = humanPlayer;

    // Check if player wins or draw after player move
    const { winner: playerWinner, line: playerLine } = checkWinner(boardAfterPlayer, gridSize);
    if (playerWinner || isBoardFull(boardAfterPlayer)) {
      const result = getGameResult(boardAfterPlayer, humanPlayer, gridSize);
      const botMsg = result === "win" ? getBotMessage("player_wins") : getBotMessage("draw");
      return NextResponse.json({
        boardAfterPlayer,
        gameResult: result,
        winningLine: playerLine,
        botMessage: botMsg,
        aiMove: null,
        boardAfterAI: null,
        gameResultAfterAI: null,
        winningLineAfterAI: null,
        botMessageAfterAI: null,
      });
    }

    // Get bot message after player move
    const botMessage = getBotMessage("after_player_move", boardAfterPlayer, cellIndex, humanPlayer, aiPlayer);

    // AI move
    const aiMove = getAIMove(boardAfterPlayer, difficulty as Difficulty, aiPlayer as Player, humanPlayer as Player, gridSize);
    const boardAfterAI = [...boardAfterPlayer];
    boardAfterAI[aiMove] = aiPlayer;

    // Check if AI wins or draw after AI move
    const { winner: aiWinner, line: aiLine } = checkWinner(boardAfterAI, gridSize);
    const gameResultAfterAI = getGameResult(boardAfterAI, humanPlayer, gridSize);

    let botMessageAfterAI = "";
    if (aiWinner === aiPlayer) {
      botMessageAfterAI = getBotMessage("bot_wins");
    } else if (isBoardFull(boardAfterAI)) {
      botMessageAfterAI = getBotMessage("draw");
    }

    return NextResponse.json({
      boardAfterPlayer,
      gameResult: null,
      winningLine: null,
      botMessage,
      aiMove,
      boardAfterAI,
      gameResultAfterAI,
      winningLineAfterAI: aiLine,
      botMessageAfterAI,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
