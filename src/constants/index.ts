// Game constants
export const BOARD_CONFIGS = {
  "3x3": {
    size: 9,
    rows: 3,
    cols: 3,
    winningCombinations: [
      [0, 1, 2], // Top row
      [3, 4, 5], // Middle row
      [6, 7, 8], // Bottom row
      [0, 3, 6], // Left column
      [1, 4, 7], // Middle column
      [2, 5, 8], // Right column
      [0, 4, 8], // Diagonal top-left to bottom-right
      [2, 4, 6], // Diagonal top-right to bottom-left
    ] as const
  },
  "4x4": {
    size: 16,
    rows: 4,
    cols: 4,
    winningCombinations: [
      // Rows
      [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
      // Columns
      [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
      // Diagonals
      [0, 5, 10, 15], [3, 6, 9, 12]
    ] as const
  },
  "5x5": {
    size: 25,
    rows: 5,
    cols: 5,
    winningCombinations: [
      // Rows
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      // Columns
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ] as const
  }
} as const;

export type GridSize = keyof typeof BOARD_CONFIGS;
export const DEFAULT_GRID_SIZE: GridSize = "3x3";

// Backward compatibility
export const BOARD_SIZE = BOARD_CONFIGS["3x3"].size;
export const WINNING_COMBINATIONS = BOARD_CONFIGS["3x3"].winningCombinations;

// Game difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

// Grid difficulty mapping
export const DIFFICULTY_GRID_CONFIGS = {
  easy: ["3x3"] as GridSize[],
  medium: ["3x3", "4x4"] as GridSize[],
  hard: ["3x3", "4x4", "5x5"] as GridSize[],
} as const;

// API constants
export const API_ENDPOINTS = {
  GAME_MOVE: '/api/game/move',
  GAME_RESULT: '/api/game/result',
  GAME_HISTORY: '/api/game/history',
  USER_STATS: '/api/user/stats',
  LEADERBOARD: '/api/leaderboard',
  HEALTH: '/api/health',
} as const;

// Cache constants
export const CACHE_KEYS = {
  LEADERBOARD: 'leaderboard',
  USER_STATS: 'user_stats',
} as const;

export const CACHE_TTL = {
  LEADERBOARD: 60, // 60 seconds
  USER_STATS: 30, // 30 seconds
} as const;

// Game results
export const GAME_RESULTS = {
  WIN: 'win',
  LOSS: 'loss',
  DRAW: 'draw',
} as const;

// Player types
export const PLAYERS = {
  X: 'X',
  O: 'O',
} as const;

// Animation durations (ms)
export const ANIMATION_DURATIONS = {
  BOT_THINKING: 600,
  CELL_ANIMATION: 300,
  WIN_LINE: 400,
} as const;

// Turn timer settings (seconds)
export const TURN_TIMER = {
  EASY: 30,    // 30 seconds for beginners - plenty of time to think
  MEDIUM: 20,  // 20 seconds for intermediate - comfortable thinking time
  HARD: 15,    // 15 seconds for experts - still reasonable
} as const;

export const DEFAULT_TURN_TIME = 20; // Default 20 seconds
