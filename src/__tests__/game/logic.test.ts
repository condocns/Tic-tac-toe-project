import { describe, it, expect } from "vitest";
import {
  createEmptyBoard,
  checkWinner,
  isBoardFull,
  getAvailableMoves,
  getGameResult,
  type Board,
} from "@/lib/game/logic";

describe("createEmptyBoard", () => {
  it("should create a board with 9 null cells", () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(9);
    expect(board.every((cell) => cell === null)).toBe(true);
  });
});

describe("checkWinner", () => {
  it("should return null when no winner", () => {
    const board = createEmptyBoard();
    const { winner, line } = checkWinner(board);
    expect(winner).toBeNull();
    expect(line).toBeNull();
  });

  it("should detect X winning on top row", () => {
    const board: Board = ["X", "X", "X", null, null, null, null, null, null];
    const { winner, line } = checkWinner(board);
    expect(winner).toBe("X");
    expect(line).toEqual([0, 1, 2]);
  });

  it("should detect O winning on middle row", () => {
    const board: Board = [null, null, null, "O", "O", "O", null, null, null];
    const { winner, line } = checkWinner(board);
    expect(winner).toBe("O");
    expect(line).toEqual([3, 4, 5]);
  });

  it("should detect X winning on diagonal", () => {
    const board: Board = ["X", null, null, null, "X", null, null, null, "X"];
    const { winner, line } = checkWinner(board);
    expect(winner).toBe("X");
    expect(line).toEqual([0, 4, 8]);
  });

  it("should detect O winning on anti-diagonal", () => {
    const board: Board = [null, null, "O", null, "O", null, "O", null, null];
    const { winner, line } = checkWinner(board);
    expect(winner).toBe("O");
    expect(line).toEqual([2, 4, 6]);
  });

  it("should detect X winning on left column", () => {
    const board: Board = ["X", null, null, "X", null, null, "X", null, null];
    const { winner, line } = checkWinner(board);
    expect(winner).toBe("X");
    expect(line).toEqual([0, 3, 6]);
  });
});

describe("isBoardFull", () => {
  it("should return false for empty board", () => {
    expect(isBoardFull(createEmptyBoard())).toBe(false);
  });

  it("should return true for full board", () => {
    const board: Board = ["X", "O", "X", "O", "X", "O", "O", "X", "O"];
    expect(isBoardFull(board)).toBe(true);
  });

  it("should return false for partially filled board", () => {
    const board: Board = ["X", "O", null, null, null, null, null, null, null];
    expect(isBoardFull(board)).toBe(false);
  });
});

describe("getAvailableMoves", () => {
  it("should return all indices for empty board", () => {
    expect(getAvailableMoves(createEmptyBoard())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("should return empty array for full board", () => {
    const board: Board = ["X", "O", "X", "O", "X", "O", "O", "X", "O"];
    expect(getAvailableMoves(board)).toEqual([]);
  });

  it("should return only empty cells", () => {
    const board: Board = ["X", null, "O", null, "X", null, null, null, null];
    expect(getAvailableMoves(board)).toEqual([1, 3, 5, 6, 7, 8]);
  });
});

describe("getGameResult", () => {
  it("should return 'win' when human player wins", () => {
    const board: Board = ["X", "X", "X", "O", "O", null, null, null, null];
    expect(getGameResult(board, "X")).toBe("win");
  });

  it("should return 'loss' when AI wins", () => {
    const board: Board = ["O", "O", "O", "X", "X", null, null, null, null];
    expect(getGameResult(board, "X")).toBe("loss");
  });

  it("should return 'draw' when board is full with no winner", () => {
    const board: Board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(getGameResult(board, "X")).toBe("draw");
  });

  it("should return null when game is not finished", () => {
    const board: Board = ["X", null, null, null, "O", null, null, null, null];
    expect(getGameResult(board, "X")).toBeNull();
  });
});
