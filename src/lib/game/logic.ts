export type Player = "X" | "O";
export type CellValue = Player | null;
export type Board = CellValue[];
export type GameResult = "win" | "loss" | "draw" | null;
export type Difficulty = "easy" | "hard";

export const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export function createEmptyBoard(): Board {
  return Array(9).fill(null);
}

export function checkWinner(board: Board): { winner: Player | null; line: number[] | null } {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: [a, b, c] };
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

export function getGameResult(board: Board, humanPlayer: Player): GameResult {
  const { winner } = checkWinner(board);
  if (winner === humanPlayer) return "win";
  if (winner !== null) return "loss";
  if (isBoardFull(board)) return "draw";
  return null;
}
