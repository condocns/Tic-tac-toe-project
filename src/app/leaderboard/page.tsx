"use client";

import { useState, useTransition, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { PageLoading } from "@/components/ui/page-loading";
import { PageTransition } from "@/components/ui/navigation-loading";

interface LeaderboardUser {
  id: string;
  name: string | null;
  image: string | null;
  score: number;
  wins: number;
  losses: number;
  draws: number;
  bestStreak: number;
  gamesPlayed: number;
}

interface LeaderboardData {
  users: LeaderboardUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // 2026 Standard: ใช้ useTransition สำหรับ non-urgent navigation
  const [isPending, startTransition] = useTransition();

  const { data, isLoading, error } = useLeaderboard({ page, limit: 20, search }) as {
  data: LeaderboardData | null;
  isLoading: boolean;
  error: unknown;
};

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) redirect("/login");

  if (isLoading && !data) {
    return <PageLoading />;
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-mono text-muted-foreground w-5 text-center">{rank}</span>;
  };

  return (
    <PageTransition isPending={isPending}>
      <div className="container max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Leaderboard</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => startTransition(() => { setSearch(e.target.value); setPage(1); })}
          className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Leaderboard list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Rankings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {isLoading || !data ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : data?.users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No players found.</p>
          ) : (
            data?.users.map((user, index) => {
              const rank = (page - 1) * 20 + index + 1;
              const isCurrentUser = user.id === session?.user?.id;

              return (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    isCurrentUser ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(rank)}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                    <AvatarFallback>{user.name?.charAt(0) ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.name ?? "Anonymous"}
                      {isCurrentUser && <span className="text-xs text-primary ml-1">(You)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.wins}W / {user.losses}L / {user.draws}D
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{user.score}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1 || isPending}
            onClick={() => startTransition(() => setPage((p) => p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {data.pagination.totalPages}</span>
          <Button
            variant="outline"
            size="icon"
            disabled={page === data.pagination.totalPages || isPending}
            onClick={() => startTransition(() => setPage((p) => p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      </div>
    </PageTransition>
  );
}
