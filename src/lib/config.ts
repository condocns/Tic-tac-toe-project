// Runtime configuration for client-side environment variables
export const getRuntimeConfig = () => {
  return {
    TURN_TIMER: {
      EASY: Number(process.env.NEXT_PUBLIC_TURN_TIMER_EASY) || 30,
      MEDIUM: Number(process.env.NEXT_PUBLIC_TURN_TIMER_MEDIUM) || 20,
      HARD: Number(process.env.NEXT_PUBLIC_TURN_TIMER_HARD) || 15,
    }
  };
};
