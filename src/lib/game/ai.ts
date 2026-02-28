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

  // 60% chance to make smart move, 40% random
  if (Math.random() < 0.6) {
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

    // Take center if available (strategic position)
    if (board[4] === null) return 4;
    
    // Take corners (strategic positions)
    const corners = [0, 2, 6, 8].filter(i => board[i] === null);
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
  }

  // Random move as fallback
  return moves[Math.floor(Math.random() * moves.length)];
}

function getMediumMove(board: Board, aiPlayer: Player, humanPlayer: Player): number {
  const moves = getAvailableMoves(board);

  // 80% smart moves, 20% random
  if (Math.random() < 0.8) {
    // Use minimax with limited depth for "good enough" moves
    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      board[move] = aiPlayer;
      const score = minimax(board, 2, false, aiPlayer, humanPlayer); // Limited depth
      board[move] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // Random move as fallback
  return moves[Math.floor(Math.random() * moves.length)];
}

export function getAIMove(
  board: Board,
  difficulty: Difficulty,
  aiPlayer: Player,
  humanPlayer: Player
): number {
  switch (difficulty) {
    case "hard":
      return getHardMove([...board], aiPlayer, humanPlayer);
    case "medium":
      return getMediumMove([...board], aiPlayer, humanPlayer);
    case "easy":
      return getEasyMove([...board], aiPlayer, humanPlayer);
  }
}
