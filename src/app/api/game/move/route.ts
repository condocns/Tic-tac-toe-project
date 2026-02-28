import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAIMove } from "@/lib/game/ai";
import { checkWinner, isBoardFull, getGameResult, type Board, type Difficulty, type Player } from "@/lib/game/logic";
import { getBotMessage } from "@/lib/game/bot-messages";
import { BOARD_CONFIGS } from "@/constants";

interface MoveRequest {
  cellIndex: number;
  board?: Board;
  difficulty?: Difficulty;
  humanPlayer?: Player;
  aiPlayer?: Player;
  gridSize?: string;
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: MoveRequest = await req.json();
    const { cellIndex, gridSize = "3x3" } = body;
    const board: Board = body.board || Array(BOARD_CONFIGS[gridSize as keyof typeof BOARD_CONFIGS].size).fill(null);
    const difficulty: Difficulty = body.difficulty || "easy";
    const humanPlayer: Player = body.humanPlayer || "X";
    const aiPlayer: Player = body.aiPlayer || "O";

    // Get the actual board size based on grid configuration
    const boardSize = BOARD_CONFIGS[gridSize as keyof typeof BOARD_CONFIGS].size;

    // Validate move
    if (cellIndex < 0 || cellIndex >= boardSize || board[cellIndex] !== null) {
      return NextResponse.json({ error: "Invalid move" }, { status: 400 });
    }

    // Apply player move
    const boardAfterPlayer = [...board];
    boardAfterPlayer[cellIndex] = humanPlayer;

    // Check if player wins or draw after player move
    const { winner: playerWinner, line: playerLine } = checkWinner(boardAfterPlayer, gridSize as "3x3" | "4x4" | "5x5");
    if (playerWinner || isBoardFull(boardAfterPlayer)) {
      const result = getGameResult(boardAfterPlayer, humanPlayer, gridSize as "3x3" | "4x4" | "5x5");
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
    const aiMove = getAIMove(boardAfterPlayer, difficulty, aiPlayer, humanPlayer, gridSize as "3x3" | "4x4" | "5x5");
    const boardAfterAI = [...boardAfterPlayer];
    boardAfterAI[aiMove] = aiPlayer;

    // Check if AI wins or draw after AI move
    const { winner: aiWinner, line: aiLine } = checkWinner(boardAfterAI, gridSize as "3x3" | "4x4" | "5x5");
    const gameResultAfterAI = getGameResult(boardAfterAI, humanPlayer, gridSize as "3x3" | "4x4" | "5x5");

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
