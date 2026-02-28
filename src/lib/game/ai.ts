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
  const boardSize = board.length;
  
  // For larger grids, don't use minimax (too slow)
  if (boardSize > 9) {
    // Use strategic positions for larger grids
    const centerPositions = getCenterPositions(boardSize);
    const availableCenters = centerPositions.filter(i => board[i] === null);
    if (availableCenters.length > 0) {
      return availableCenters[Math.floor(Math.random() * availableCenters.length)];
    }
    
    // Take strategic corners/edges for larger grids
    const strategicPositions = getStrategicPositions(boardSize);
    const availableStrategic = strategicPositions.filter(i => board[i] === null);
    if (availableStrategic.length > 0) {
      return availableStrategic[Math.floor(Math.random() * availableStrategic.length)];
    }
    
    return moves[Math.floor(Math.random() * moves.length)];
  }
  
  // Original minimax for 3x3 only
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

function getStrategicPositions(boardSize: number): number[] {
  if (boardSize === 16) { // 4x4
    return [0, 3, 12, 15, 5, 6, 9, 10]; // Corners + center positions
  } else if (boardSize === 25) { // 5x5
    return [0, 4, 20, 24, 6, 8, 16, 18, 12]; // Corners + edges + center
  }
  return [0, 2, 6, 8]; // Default 3x3 corners
}

function getEasyMove(board: Board, aiPlayer: Player, humanPlayer: Player): number {
  const moves = getAvailableMoves(board);
  
  if (moves.length === 0) return -1;
  
  // For larger grids, use different strategies
  const boardSize = board.length;
  
  if (boardSize > 9) {
    // For 4x4 and 5x5 grids, prioritize center and strategic positions
    const centerPositions = getCenterPositions(boardSize);
    const availableCenters = centerPositions.filter(i => board[i] === null);
    if (availableCenters.length > 0) {
      return availableCenters[Math.floor(Math.random() * availableCenters.length)];
    }
  } else {
    // For 3x3 grid, try center first
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

function getCenterPositions(boardSize: number): number[] {
  if (boardSize === 16) { // 4x4
    return [5, 6, 9, 10]; // Center 4 positions
  } else if (boardSize === 25) { // 5x5
    return [12]; // Center position
  }
  return [Math.floor(boardSize / 2)]; // Default center
}

function getMediumMove(board: Board, aiPlayer: Player, humanPlayer: Player): number {
  const moves = getAvailableMoves(board);
  const boardSize = board.length;

  // For larger grids, use strategic positions (no minimax)
  if (boardSize > 9) {
    // 70% strategic moves, 30% random
    if (Math.random() < 0.7) {
      const centerPositions = getCenterPositions(boardSize);
      const availableCenters = centerPositions.filter(i => board[i] === null);
      if (availableCenters.length > 0) {
        return availableCenters[Math.floor(Math.random() * availableCenters.length)];
      }
      
      const strategicPositions = getStrategicPositions(boardSize);
      const availableStrategic = strategicPositions.filter(i => board[i] === null);
      if (availableStrategic.length > 0) {
        return availableStrategic[Math.floor(Math.random() * availableStrategic.length)];
      }
    }
    
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Original minimax logic for 3x3 only
  if (Math.random() < 0.8) {
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

  // Random move as fallback
  return moves[Math.floor(Math.random() * moves.length)];
}

export function getAIMove(
  board: Board,
  difficulty: Difficulty,
  aiPlayer: Player,
  humanPlayer: Player,
  gridSize?: string
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
