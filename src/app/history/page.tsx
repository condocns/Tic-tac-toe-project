"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Frown, Minus, ChevronLeft, ChevronRight, Clock, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameHistory } from "@/hooks/useGameHistory";
import { PageLoading } from "@/components/ui/page-loading";
import { PageTransition } from "@/components/ui/navigation-loading";

interface GameRecord {
  id: string;
  result: string;
  difficulty: string;
  moves: string;
  duration: number;
  createdAt: string;
}

interface HistoryResponse {
  games: GameRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [page, setPage] = useState(1);
  
  // 2026 Standard: ใช้ useTransition สำหรับ non-urgent navigation
  const [isPending, startTransition] = useTransition();
  
  const { data, isLoading } = useGameHistory({ page, limit: 10 }) as { data: HistoryResponse | undefined, isLoading: boolean };

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

  const games: GameRecord[] = data?.games || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const getResultDisplay = (result: string) => {
    // Convert uppercase DB values to lowercase for comparison
    const normalizedResult = result.toLowerCase();
    
    switch (normalizedResult) {
      case "win":
        return { icon: <Trophy className="h-4 w-4 text-green-500" />, text: "Win", color: "text-green-500", bg: "bg-green-500/10" };
      case "loss":
        return { icon: <Frown className="h-4 w-4 text-red-500" />, text: "Loss", color: "text-red-500", bg: "bg-red-500/10" };
      default:
        return { icon: <Minus className="h-4 w-4 text-yellow-500" />, text: "Draw", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    }
  };

  return (
    <PageTransition isPending={isPending}>
      <div className="container max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Match History</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Games</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : games.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No games played yet. Start playing!</p>
          ) : (
            games.map((game) => {
              const display = getResultDisplay(game.result);
              const date = new Date(game.createdAt);

              return (
                <div
                  key={game.id}
                  className="flex items-center gap-3 rounded-lg border px-4 py-3"
                >
                  <div className={cn("flex items-center justify-center rounded-full p-2", display.bg)}>
                    {display.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold", display.color)}>
                      {display.text}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Swords className="h-3 w-3" />
                        {game.difficulty}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {game.duration}s
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={page === 1 || isPending} 
            onClick={() => startTransition(() => setPage((p) => Math.max(1, p - 1)))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button 
            variant="outline" 
            size="icon" 
            disabled={page >= totalPages || isPending} 
            onClick={() => startTransition(() => setPage((p) => Math.min(totalPages, p + 1)))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      </div>
    </PageTransition>
  );
}
