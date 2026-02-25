import { create } from "zustand";
import { type Board, type Player, type GameResult, type Difficulty, createEmptyBoard } from "./logic";

interface GameState {
  board: Board;
  humanPlayer: Player;
  aiPlayer: Player;
  currentTurn: Player;
  difficulty: Difficulty;
  gameResult: GameResult;
  winningLine: number[] | null;
  isAiThinking: boolean;
  botMessage: string;
  moves: number[];
  gameStartTime: number | null;
  gameDuration: number;

  // Actions
  setDifficulty: (difficulty: Difficulty) => void;
  makeMove: (index: number) => void;
  setBoard: (board: Board) => void;
  setCurrentTurn: (player: Player) => void;
  setGameResult: (result: GameResult) => void;
  setWinningLine: (line: number[] | null) => void;
  setIsAiThinking: (thinking: boolean) => void;
  setBotMessage: (message: string) => void;
  addMove: (index: number) => void;
  resetGame: () => void;
  startGame: () => void;
  endGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: createEmptyBoard(),
  humanPlayer: "X",
  aiPlayer: "O",
  currentTurn: "X",
  difficulty: "easy",
  gameResult: null,
  winningLine: null,
  isAiThinking: false,
  botMessage: "",
  moves: [],
  gameStartTime: null,
  gameDuration: 0,

  setDifficulty: (difficulty) => set({ difficulty }),

  makeMove: (index) => {
    const { board, currentTurn } = get();
    if (board[index] !== null) return;
    const newBoard = [...board];
    newBoard[index] = currentTurn;
    set({ board: newBoard });
  },

  setBoard: (board) => set({ board }),
  setCurrentTurn: (player) => set({ currentTurn: player }),
  setGameResult: (result) => set({ gameResult: result }),
  setWinningLine: (line) => set({ winningLine: line }),
  setIsAiThinking: (thinking) => set({ isAiThinking: thinking }),
  setBotMessage: (message) => set({ botMessage: message }),
  addMove: (index) => set((state) => ({ moves: [...state.moves, index] })),

  resetGame: () =>
    set({
      board: createEmptyBoard(),
      currentTurn: "X",
      gameResult: null,
      winningLine: null,
      isAiThinking: false,
      botMessage: "",
      moves: [],
      gameStartTime: null,
      gameDuration: 0,
    }),

  startGame: () => set({ gameStartTime: Date.now() }),

  endGame: () => {
    const { gameStartTime } = get();
    if (gameStartTime) {
      set({ gameDuration: Math.floor((Date.now() - gameStartTime) / 1000) });
    }
  },
}));
