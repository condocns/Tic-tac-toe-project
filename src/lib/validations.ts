import { z } from "zod";

// Base pagination schema that can be reused across different endpoints
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Admin players query schema (extends pagination)
export const adminQuerySchema = paginationSchema.extend({
  limit: z.coerce.number().min(1).max(100).default(20), // Override default limit for admin
  search: z.string().max(100).optional().default(""),
  adminOnly: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(["score", "wins", "losses", "gamesPlayed", "createdAt"]).default("score"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// History query schema (extends pagination)
export const historyQuerySchema = paginationSchema.extend({
  limit: z.coerce.number().min(1).max(50).default(10), // Specific limit for history
});

export const gameMoveSchema = z
  .object({
    cellIndex: z.number().int().min(0).max(24),
    board: z.array(z.enum(["X", "O"]).nullable()).max(25).optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional().default("easy"),
    humanPlayer: z.enum(["X", "O"]).optional().default("X"),
    aiPlayer: z.enum(["X", "O"]).optional().default("O"),
    gridSize: z.enum(["3x3", "4x4", "5x5"]).optional().default("3x3"),
  })
  .refine((payload) => payload.humanPlayer !== payload.aiPlayer, {
    message: "Players must use different symbols",
    path: ["aiPlayer"],
  });

// Leaderboard query schema (extends pagination)
export const leaderboardQuerySchema = paginationSchema.extend({
  limit: z.coerce.number().min(1).max(50).default(20),
  search: z
    .string()
    .max(100)
    .optional()
    .default("")
    .transform((value) => value.trim()),
});

// Game result submission schema
export const gameResultSchema = z.object({
  result: z.enum(["win", "loss", "draw"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  moves: z.array(z.number().min(0).max(24)).max(25),
  duration: z.number().min(0).max(3600),
  gridSize: z.enum(["3x3", "4x4", "5x5"]).default("3x3"),
  finalBoard: z.array(z.enum(["X", "O"]).nullable()).min(1),
  gameSessionId: z.string().uuid(),
  humanPlayer: z.enum(["X", "O"]).default("X"),
});

// User Registration schema
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
