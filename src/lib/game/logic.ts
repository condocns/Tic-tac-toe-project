import { WINNING_COMBINATIONS, BOARD_SIZE, BOARD_CONFIGS, type GridSize } from "@/constants";

export type Player = "X" | "O";
export type CellValue = Player | null;
export type Board = CellValue[];
export type GameResult = "win" | "loss" | "draw" | null;
export type Difficulty = "easy" | "medium" | "hard";

export function createEmptyBoard(gridSize: GridSize = "3x3"): Board {
  return Array(BOARD_CONFIGS[gridSize].size).fill(null);
}

export function checkWinner(board: Board, gridSize: GridSize = "3x3"): { winner: Player | null; line: number[] | null } {
  const combinations = BOARD_CONFIGS[gridSize].winningCombinations;
  for (const combo of combinations) {
    const [first, ...rest] = combo;
    if (board[first] && rest.every(index => board[index] === board[first])) {
      return { winner: board[first] as Player, line: [...combo] };
    }
  }
  return { winner: null, line: null };
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

export function getAvailableMoves(board: Board): number[] {
  return board.reduce<number[]>((moves, cell, index) => {
    if (cell === null) moves.push(index);
    return moves;
  }, []);
}

export function getGameResult(board: Board, humanPlayer: Player, gridSize: GridSize = "3x3"): GameResult {
  const { winner } = checkWinner(board, gridSize);
  if (winner === humanPlayer) return "win";
  if (winner !== null) return "loss";
  if (isBoardFull(board)) return "draw";
  return null;
}
