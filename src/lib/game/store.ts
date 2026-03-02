import { create } from "zustand";
import { type Board, type Player, type GameResult, type Difficulty, createEmptyBoard } from "./logic";
import { type GridSize, DEFAULT_GRID_SIZE } from "@/constants";
import { getRuntimeConfig } from "@/lib/config";

interface GameState {
  board: Board;
  humanPlayer: Player;
  aiPlayer: Player;
  currentTurn: Player;
  difficulty: Difficulty;
  gridSize: GridSize;
  gameResult: GameResult;
  winningLine: number[] | null;
  isAiThinking: boolean;
  botMessage: string;
  moves: number[];
  gameStartTime: number | null;
  gameDuration: number;
  resultSaved: boolean; // Prevent duplicate API calls
  
  // Turn timer
  turnStartTime: number | null;
  timeRemaining: number;
  isTimerActive: boolean;

  // Actions
  setDifficulty: (difficulty: Difficulty) => void;
  setGridSize: (gridSize: GridSize) => void;
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
  setResultSaved: (saved: boolean) => void; // New action
  
  // Timer actions
  startTurnTimer: () => void;
  stopTurnTimer: () => void;
  updateTimeRemaining: (time: number) => void;
  handleTimeExpired: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: createEmptyBoard(DEFAULT_GRID_SIZE),
  humanPlayer: "X",
  aiPlayer: "O",
  currentTurn: "X",
  difficulty: "easy",
  gridSize: DEFAULT_GRID_SIZE,
  gameResult: null,
  winningLine: null,
  isAiThinking: false,
  botMessage: "",
  moves: [],
  gameStartTime: null,
  gameDuration: 0,
  resultSaved: false, // Prevent duplicate API calls
  
  // Timer state
  turnStartTime: null,
  timeRemaining: 20,
  isTimerActive: false,

  setDifficulty: (difficulty) => set({ difficulty }),
  setGridSize: (gridSize) => set({ gridSize, board: createEmptyBoard(gridSize) }),

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
  setResultSaved: (saved) => set({ resultSaved: saved }), // New action

  resetGame: () =>
    set({
      board: createEmptyBoard(get().gridSize),
      currentTurn: "X",
      gameResult: null,
      winningLine: null,
      isAiThinking: false,
      botMessage: "",
      moves: [],
      gameStartTime: null,
      gameDuration: 0,
      resultSaved: false, // Reset result saved flag
      turnStartTime: null,
      timeRemaining: 20,
      isTimerActive: false,
    }),

  startGame: () => set({ gameStartTime: Date.now() }),

  endGame: () => {
    const { gameStartTime } = get();
    if (gameStartTime) {
      set({ gameDuration: Math.floor((Date.now() - gameStartTime) / 1000) });
    }
  },
  
  // Timer actions
  startTurnTimer: () => {
    const { difficulty } = get();
    const config = getRuntimeConfig();
    const turnTime = config.TURN_TIMER[difficulty.toUpperCase() as keyof typeof config.TURN_TIMER];
    set({
      turnStartTime: Date.now(),
      timeRemaining: turnTime,
      isTimerActive: true,
    });
  },
  
  stopTurnTimer: () => set({
    turnStartTime: null,
    isTimerActive: false,
  }),
  
  updateTimeRemaining: (time) => set({ timeRemaining: time }),
  
  handleTimeExpired: () => {
    const { currentTurn, humanPlayer, isAiThinking, board, difficulty, aiPlayer, humanPlayer: human, addMove } = get();
    
    // Only handle timeout for human turn, not AI turn
    if (currentTurn === humanPlayer && !isAiThinking) {
      // Find a random available move for AI
      const availableMoves = board.reduce<number[]>((moves, cell, index) => {
        if (cell === null) moves.push(index);
        return moves;
      }, []);
      
      if (availableMoves.length > 0) {
        // Make AI move immediately as penalty
        const aiMoveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        const newBoard = [...board];
        newBoard[aiMoveIndex] = aiPlayer;
        
        // Add the move to history
        addMove(aiMoveIndex);
        
        set({
          board: newBoard,
          currentTurn: humanPlayer, // Switch back to human turn
          turnStartTime: null,
          isTimerActive: false,
          botMessage: "⏰ Time's up! AI took a random move!",
        });
      } else {
        // No moves available, game should be over
        set({
          turnStartTime: null,
          isTimerActive: false,
          botMessage: "⏰ Time's up! But there are no moves left.",
        });
      }
    }
  },
}));
