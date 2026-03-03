// Runtime configuration for client-side environment variables
export const getRuntimeConfig = () => {
  return {
    TURN_TIMER: {
      EASY: Number(process.env.NEXT_PUBLIC_TURN_TIMER_EASY) || 60,
      MEDIUM: Number(process.env.NEXT_PUBLIC_TURN_TIMER_MEDIUM) || 80,
      HARD: Number(process.env.NEXT_PUBLIC_TURN_TIMER_HARD) || 100,
    },
    BOT_THINKING: {
      EASY: (Number(process.env.NEXT_PUBLIC_BOT_THINKING_EASY) || 1.5) * 1000, // Convert seconds to ms
      MEDIUM: (Number(process.env.NEXT_PUBLIC_BOT_THINKING_MEDIUM) || 1.5) * 1000, // Convert seconds to ms
      HARD: (Number(process.env.NEXT_PUBLIC_BOT_THINKING_HARD) || 1.5) * 1000, // Convert seconds to ms
    }
  };
};

// Game-related constants
export const GAME_CONFIG = {
  SESSION_EXPIRY: 3600, // 1 hour in seconds
  LEADERBOARD_CACHE_PATTERN: "leaderboard:*",
} as const;
