// Runtime configuration for client-side environment variables
export const getRuntimeConfig = () => {
  return {
    TURN_TIMER: {
      EASY: Number(process.env.NEXT_PUBLIC_TURN_TIMER_EASY) || 30,
      MEDIUM: Number(process.env.NEXT_PUBLIC_TURN_TIMER_MEDIUM) || 20,
      HARD: Number(process.env.NEXT_PUBLIC_TURN_TIMER_HARD) || 15,
    },
    BOT_THINKING: {
      EASY: (Number(process.env.NEXT_PUBLIC_BOT_THINKING_EASY) || 2) * 1000, // Convert seconds to ms
      MEDIUM: (Number(process.env.NEXT_PUBLIC_BOT_THINKING_MEDIUM) || 3) * 1000, // Convert seconds to ms
      HARD: (Number(process.env.NEXT_PUBLIC_BOT_THINKING_HARD) || 4) * 1000, // Convert seconds to ms
    }
  };
};
