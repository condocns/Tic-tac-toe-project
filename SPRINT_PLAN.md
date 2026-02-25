# Sprint Plan - Tic-Tac-Toe Web Application

## Sprint 1: Project Setup & Authentication ✅
- [x] Initialize Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- [x] Install & configure ShadCN UI components (Button, Card, Avatar)
- [x] Set up Prisma 7 ORM + PostgreSQL schema (User, Game, Score)
- [x] Configure NextAuth.js (OAuth 2.0 with Google/GitHub)
- [x] Protected routes via middleware (redirect to login if unauthenticated)
- [x] Login/Logout UI with Google & GitHub OAuth buttons
- [x] Responsive Navbar with mobile hamburger menu

## Sprint 2: Game Core (Tic-Tac-Toe + AI Bot) ✅
- [x] Game board UI (responsive, mobile-first, max-w scales per breakpoint)
- [x] Game logic (win/loss/draw detection, winning line detection)
- [x] AI Bot - Easy mode (30% smart / 70% random moves)
- [x] AI Bot - Hard mode (Minimax algorithm, unbeatable)
- [x] "Bot is thinking..." animation (600ms delay)
- [x] Bot taunting messages based on board state (8 categories)
- [x] Framer Motion animations (spring scale for X/O, win line overlay)
- [x] Server-side AI via POST /api/game/move (prevents cheating)

## Sprint 3: Scoring System & Database ✅
- [x] Server-side score calculation (Win +1, Loss -1)
- [x] Streak tracking (3 consecutive wins = +1 bonus, reset streak)
- [x] Match history storage (save move sequence as JSON per game)
- [x] Atomic database transactions for score + streak updates
- [x] User stats API (GET /api/user/stats)
- [x] Match history API with pagination (GET /api/game/history)

## Sprint 4: Leaderboard & Admin Dashboard ✅
- [x] Leaderboard page (all player scores, pagination, search)
- [x] Redis caching for leaderboard (TTL 60s, polling every 30s)
- [x] Admin dashboard (view all players' scores, stats cards)
- [x] Role-based access control (RBAC) for admin API
- [x] Sortable columns (score, wins, losses, games played)
- [x] Admin API: aggregate stats (total players, games, avg score)

## Sprint 5: Extra Features & Polish ✅
- [x] Match history playback (replay past games step-by-step)
- [x] Dark/Light mode toggle (system-aware, persisted in localStorage)
- [x] Health check endpoint (GET /api/health with DB latency)
- [x] ThemeToggle integrated into Navbar

## Sprint 6: Testing & CI/CD & Documentation ✅
- [x] 23 Unit tests (Vitest) — game logic & AI correctness (all passing)
- [x] AI never-lose test (50 random games, hard mode verified)
- [x] GitHub Actions CI/CD pipeline (lint → type-check → test on PR)
- [x] README.md with Mermaid.js architecture + scoring flow diagrams
- [x] Comprehensive setup instructions and env var documentation
