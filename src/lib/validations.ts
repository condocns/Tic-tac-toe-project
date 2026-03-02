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

// You can add more schemas here as the project grows:
// export const gameResultSchema = z.object({ ... });
// export const profileUpdateSchema = z.object({ ... });
