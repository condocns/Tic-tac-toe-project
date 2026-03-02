import { Board, Player, checkWinner, isBoardFull, getAvailableMoves, type Difficulty } from "./logic";
import { BOARD_CONFIGS, type GridSize } from "@/constants";

function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player,
  gridSize: GridSize
): number {
  const { winner } = checkWinner(board, gridSize);
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (isBoardFull(board)) return 0;

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of moves) {
      board[move] = aiPlayer;
      const score = minimax(board, depth + 1, false, aiPlayer, humanPlayer, gridSize);
      board[move] = null;
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of moves) {
      board[move] = humanPlayer;
      const score = minimax(board, depth + 1, true, aiPlayer, humanPlayer, gridSize);
      board[move] = null;
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

function getHardMove(board: Board, aiPlayer: Player, humanPlayer: Player, gridSize: GridSize): number {
  const moves = getAvailableMoves(board);
  const boardSize = board.length;

  const winningMove = getImmediateMove(board, aiPlayer, gridSize);
  if (winningMove !== null) return winningMove;

  const blockingMove = getImmediateMove(board, humanPlayer, gridSize);
  if (blockingMove !== null) return blockingMove;

  // For larger grids, use heuristic scoring (minimax is too slow)
  if (boardSize > 9) {
    return getHeuristicMove(board, aiPlayer, humanPlayer, gridSize, "hard");
  }

  // Minimax for 3x3 only
  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    board[move] = aiPlayer;
    const score = minimax(board, 0, false, aiPlayer, humanPlayer, gridSize);
    board[move] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function getStrategicPositions(boardSize: number): number[] {
  if (boardSize === 16) { // 4x4
    return [0, 3, 12, 15, 5, 6, 9, 10]; // Corners + center positions
  } else if (boardSize === 25) { // 5x5
    return [0, 4, 20, 24, 6, 8, 16, 18, 12]; // Corners + edges + center
  }
  return [0, 2, 6, 8]; // Default 3x3 corners
}

function getEasyMove(board: Board, aiPlayer: Player, humanPlayer: Player, gridSize: GridSize): number {
  const moves = getAvailableMoves(board);
  
  if (moves.length === 0) return -1;

  // Easy: mostly random, small chance to win/block
  if (Math.random() < 0.2) {
    const winningMove = getImmediateMove(board, aiPlayer, gridSize);
    if (winningMove !== null) return winningMove;

    const blockingMove = getImmediateMove(board, humanPlayer, gridSize);
    if (blockingMove !== null) return blockingMove;
  }

  return moves[Math.floor(Math.random() * moves.length)];
}

function getCenterPositions(boardSize: number): number[] {
  if (boardSize === 16) { // 4x4
    return [5, 6, 9, 10]; // Center 4 positions
  } else if (boardSize === 25) { // 5x5
    return [12]; // Center position
  }
  return [Math.floor(boardSize / 2)]; // Default center
}

function getMediumMove(board: Board, aiPlayer: Player, humanPlayer: Player, gridSize: GridSize): number {
  const moves = getAvailableMoves(board);
  const boardSize = board.length;

  const winningMove = getImmediateMove(board, aiPlayer, gridSize);
  if (winningMove !== null) return winningMove;

  const blockingMove = getImmediateMove(board, humanPlayer, gridSize);
  if (blockingMove !== null && Math.random() < 0.8) return blockingMove;

  // For larger grids, use strategic positions (no minimax)
  if (boardSize > 9) {
    return getHeuristicMove(board, aiPlayer, humanPlayer, gridSize, "medium");
  }

  // Original minimax logic for 3x3 only
  if (Math.random() < 0.8) {
    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      board[move] = aiPlayer;
      const score = minimax(board, 0, false, aiPlayer, humanPlayer, gridSize);
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

function getGridSizeFromBoard(boardSize: number, gridSize?: string): GridSize {
  if (gridSize && gridSize in BOARD_CONFIGS) return gridSize as GridSize;
  if (boardSize === 16) return "4x4";
  if (boardSize === 25) return "5x5";
  return "3x3";
}

function getImmediateMove(board: Board, player: Player, gridSize: GridSize): number | null {
  const moves = getAvailableMoves(board);
  for (const move of moves) {
    board[move] = player;
    const { winner } = checkWinner(board, gridSize);
    board[move] = null;
    if (winner === player) return move;
  }
  return null;
}

function getHeuristicMove(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
  gridSize: GridSize,
  mode: "medium" | "hard"
): number {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) return -1;

  const boardSize = board.length;
  const centerPositions = getCenterPositions(boardSize);
  const strategicPositions = getStrategicPositions(boardSize);

  if (mode === "medium" && Math.random() < 0.35) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    board[move] = aiPlayer;
    const score = scoreBoard(board, aiPlayer, humanPlayer, gridSize)
      + (centerPositions.includes(move) ? 0.6 : 0)
      + (strategicPositions.includes(move) ? 0.3 : 0);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function scoreBoard(board: Board, aiPlayer: Player, humanPlayer: Player, gridSize: GridSize): number {
  const combinations = BOARD_CONFIGS[gridSize].winningCombinations;
  let score = 0;

  for (const combo of combinations) {
    let aiCount = 0;
    let humanCount = 0;

    for (const index of combo) {
      if (board[index] === aiPlayer) aiCount += 1;
      if (board[index] === humanPlayer) humanCount += 1;
    }

    if (aiCount > 0 && humanCount > 0) continue;
    if (aiCount > 0) score += Math.pow(aiCount, 2);
    if (humanCount > 0) score -= humanCount * 0.8;
  }

  return score;
}

export function getAIMove(
  board: Board,
  difficulty: Difficulty,
  aiPlayer: Player,
  humanPlayer: Player,
  gridSize?: string
): number {
  const resolvedGridSize = getGridSizeFromBoard(board.length, gridSize);
  switch (difficulty) {
    case "hard":
      return getHardMove([...board], aiPlayer, humanPlayer, resolvedGridSize);
    case "medium":
      return getMediumMove([...board], aiPlayer, humanPlayer, resolvedGridSize);
    case "easy":
      return getEasyMove([...board], aiPlayer, humanPlayer, resolvedGridSize);
  }
}
