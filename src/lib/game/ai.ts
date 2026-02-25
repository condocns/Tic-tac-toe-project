import { Board, Player, checkWinner, isBoardFull, getAvailableMoves, type Difficulty } from "./logic";

function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player
): number {
  const { winner } = checkWinner(board);
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (isBoardFull(board)) return 0;

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of moves) {
      board[move] = aiPlayer;
      const score = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
      board[move] = null;
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of moves) {
      board[move] = humanPlayer;
      const score = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
      board[move] = null;
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

function getHardMove(board: Board, aiPlayer: Player, humanPlayer: Player): number {
  const moves = getAvailableMoves(board);
  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    board[move] = aiPlayer;
    const score = minimax(board, 0, false, aiPlayer, humanPlayer);
    board[move] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function getEasyMove(board: Board, aiPlayer: Player, humanPlayer: Player): number {
  const moves = getAvailableMoves(board);

  // 30% chance to make a smart move, 70% random
  if (Math.random() < 0.3) {
    // Check if AI can win in one move
    for (const move of moves) {
      board[move] = aiPlayer;
      const { winner } = checkWinner(board);
      board[move] = null;
      if (winner === aiPlayer) return move;
    }

    // Check if human can win in one move and block
    for (const move of moves) {
      board[move] = humanPlayer;
      const { winner } = checkWinner(board);
      board[move] = null;
      if (winner === humanPlayer) return move;
    }
  }

  // Random move
  return moves[Math.floor(Math.random() * moves.length)];
}

export function getAIMove(
  board: Board,
  difficulty: Difficulty,
  aiPlayer: Player,
  humanPlayer: Player
): number {
  if (difficulty === "hard") {
    return getHardMove([...board], aiPlayer, humanPlayer);
  }
  return getEasyMove([...board], aiPlayer, humanPlayer);
}
