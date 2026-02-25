import { describe, it, expect } from "vitest";
import { getAIMove } from "@/lib/game/ai";
import { checkWinner, type Board } from "@/lib/game/logic";

describe("getAIMove - Easy Mode", () => {
  it("should return a valid move index", () => {
    const board: Board = [null, null, null, null, null, null, null, null, null];
    const move = getAIMove(board, "easy", "O", "X");
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
    expect(board[move]).toBeNull();
  });

  it("should not place on an occupied cell", () => {
    const board: Board = ["X", "O", "X", "O", null, null, null, null, null];
    const move = getAIMove(board, "easy", "O", "X");
    expect(board[move]).toBeNull();
  });
});

describe("getAIMove - Hard Mode (Minimax)", () => {
  it("should return a valid move index", () => {
    const board: Board = [null, null, null, null, null, null, null, null, null];
    const move = getAIMove(board, "hard", "O", "X");
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
  });

  it("should take the winning move when available", () => {
    const board: Board = ["X", "X", null, "O", "O", null, null, null, null];
    const move = getAIMove(board, "hard", "O", "X");
    expect(move).toBe(5); // O should complete row 2
  });

  it("should block the opponent from winning", () => {
    const board: Board = ["X", "X", null, "O", null, null, null, null, null];
    const move = getAIMove(board, "hard", "O", "X");
    expect(move).toBe(2); // Must block X from winning top row
  });

  it("should never lose when playing optimally from empty board", () => {
    // Simulate 50 games where AI (hard) plays as O
    for (let game = 0; game < 50; game++) {
      const board: Board = [null, null, null, null, null, null, null, null, null];
      let currentPlayer: "X" | "O" = "X";

      while (true) {
        if (currentPlayer === "X") {
          // Random move for X
          const available = board.reduce<number[]>((acc, cell, i) => {
            if (cell === null) acc.push(i);
            return acc;
          }, []);
          if (available.length === 0) break;
          const randomMove = available[Math.floor(Math.random() * available.length)];
          board[randomMove] = "X";
        } else {
          const aiMove = getAIMove(board, "hard", "O", "X");
          board[aiMove] = "O";
        }

        const { winner } = checkWinner(board);
        if (winner === "X") {
          // AI should never lose
          expect.fail("AI (hard) should never lose, but X won");
        }
        if (winner === "O" || board.every((c) => c !== null)) break;

        currentPlayer = currentPlayer === "X" ? "O" : "X";
      }
    }
  });
});
