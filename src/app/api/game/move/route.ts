import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAIMove } from "@/lib/game/ai";
import { checkWinner, isBoardFull, getGameResult, type Board, type Difficulty, type Player } from "@/lib/game/logic";
import { getBotMessage } from "@/lib/game/bot-messages";

interface MoveRequest {
  cellIndex: number;
  board?: Board;
  difficulty?: Difficulty;
  humanPlayer?: Player;
  aiPlayer?: Player;
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: MoveRequest = await req.json();
    const { cellIndex } = body;
    const board: Board = body.board || Array(9).fill(null);
    const difficulty: Difficulty = body.difficulty || "easy";
    const humanPlayer: Player = body.humanPlayer || "X";
    const aiPlayer: Player = body.aiPlayer || "O";

    // Validate move
    if (cellIndex < 0 || cellIndex > 8 || board[cellIndex] !== null) {
      return NextResponse.json({ error: "Invalid move" }, { status: 400 });
    }

    // Apply player move
    const boardAfterPlayer = [...board];
    boardAfterPlayer[cellIndex] = humanPlayer;

    // Check if player wins or draw after player move
    const { winner: playerWinner, line: playerLine } = checkWinner(boardAfterPlayer);
    if (playerWinner || isBoardFull(boardAfterPlayer)) {
      const result = getGameResult(boardAfterPlayer, humanPlayer);
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
    const aiMove = getAIMove(boardAfterPlayer, difficulty, aiPlayer, humanPlayer);
    const boardAfterAI = [...boardAfterPlayer];
    boardAfterAI[aiMove] = aiPlayer;

    // Check if AI wins or draw after AI move
    const { winner: aiWinner, line: aiLine } = checkWinner(boardAfterAI);
    const gameResultAfterAI = getGameResult(boardAfterAI, humanPlayer);

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
