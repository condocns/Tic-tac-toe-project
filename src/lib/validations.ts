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
  moves: z.array(z.number().min(0).max(24)).max(25), // max 5x5 board = 25 moves
  duration: z.number().min(0).max(3600), // Max 1 hour
});

// User Registration schema
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
