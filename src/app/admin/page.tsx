"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Users, Gamepad2, BarChart3, Search, ChevronLeft, ChevronRight, ArrowUpDown, Ban, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLoading } from "@/components/ui/page-loading";
import { NavigationLoading, PageTransition } from "@/components/ui/navigation-loading";
import { useSessionValidator } from "@/hooks/useSessionValidator";

interface Player {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  score: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  gamesPlayed: number;
  createdAt: string;
}

interface AdminData {
  players: Player[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  stats: { totalPlayers: number; totalGamesPlayed: number; averageScore: number };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  
  // Auto-logout if session is revoked
  useSessionValidator();
  
  const [data, setData] = useState<AdminData | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdminOnly, setIsAdminOnly] = useState(false);
  const [sortBy, setSortBy] = useState("score");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revokingUserId, setRevokingUserId] = useState<string | null>(null);
  
  // 2026 Standard: ใช้ useTransition สำหรับ non-urgent navigation
  const [isPending, startTransition] = useTransition();

  // Debounce search to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        sortBy,
        order,
      });
      if (searchQuery) params.set("search", searchQuery);
      if (isAdminOnly) params.set("adminOnly", "true");
      
      const cacheKey = `admin_players_${params.toString()}`;
      
      // Check cache first
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        // Cache for 2 minutes
        if (Date.now() - timestamp < 2 * 60 * 1000) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }
      
      const res = await fetch(`/api/admin/players?${params}`);
      if (res.status === 403) {
        setError("Access denied. Admin role required.");
        return;
      }
      if (res.ok) {
        const newData = await res.json();
        setData(newData);
        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify({
          data: newData,
          timestamp: Date.now()
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, sortBy, order, isAdminOnly]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const toggleSort = (field: string) => {
    startTransition(() => {
      if (sortBy === field) {
        setOrder((o) => (o === "desc" ? "asc" : "desc"));
      } else {
        setSortBy(field);
        setOrder("desc");
      }
      setPage(1);
      // Clear cache when sorting changes
      clearCache();
    });
  };

  const clearCache = useCallback(() => {
    // Clear all admin cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('admin_players_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  const revokeSession = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to revoke session for ${userName}? This will force them to logout immediately.`)) {
      return;
    }

    setRevokingUserId(userId);
    try {
      const res = await fetch('/api/admin/revoke-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        const result = await res.json();
        alert(`Session revoked: ${result.message}`);
        // Clear cache and refresh data
        clearCache();
        fetchPlayers();
      } else {
        const error = await res.json();
        alert(`Failed to revoke session: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to revoke session. Please try again.');
      console.error('Revoke session error:', error);
    } finally {
      setRevokingUserId(null);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleInvalidate = () => {
      clearCache();
      fetchPlayers();
    };

    window.addEventListener("adminPlayersInvalidate", handleInvalidate);
    return () => window.removeEventListener("adminPlayersInvalidate", handleInvalidate);
  }, [clearCache, fetchPlayers]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) redirect("/login");

  if (loading && !data) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Shield className="h-12 w-12 mx-auto text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <PageTransition isPending={isPending}>
      <div className="container max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        </div>

      {/* Stats cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{data.stats.totalPlayers}</p>
                <p className="text-xs text-muted-foreground">Total Players</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Gamepad2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{data.stats.totalGamesPlayed}</p>
                <p className="text-xs text-muted-foreground">Games Played</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{data.stats.averageScore}</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          variant={isAdminOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setIsAdminOnly(!isAdminOnly)}
          className="whitespace-nowrap"
        >
          <Shield className="h-4 w-4 mr-1" />
          Admins Only
        </Button>
      </div>

      {/* Players table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Players</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_80px_80px_80px_80px_100px_120px] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b mb-2">
            <span>Player</span>
            <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("score")}>
              Score <ArrowUpDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("wins")}>
              Wins <ArrowUpDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("losses")}>
              Losses <ArrowUpDown className="h-3 w-3" />
            </button>
            <span>Streak</span>
            <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("gamesPlayed")}>
              Games <ArrowUpDown className="h-3 w-3" />
            </button>
            <span>Actions</span>
          </div>

          {loading && !data ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-1">
              {data?.players.map((player) => {
                // Debug: Check if emails match (more reliable than ID for OAuth users)
                const isCurrentUser = player.email === session?.user?.email;
                console.log('Player Email:', player.email, 'Session Email:', session?.user?.email, 'Is current user:', isCurrentUser);
                
                return (
                <div
                  key={player.id}
                  className={cn(
                    "grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_80px_80px_100px_120px] gap-2 items-center rounded-lg px-3 py-2.5 hover:bg-muted/50",
                    player.role === "admin" && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={player.image ?? ""} />
                      <AvatarFallback>{player.name?.charAt(0) ?? "?"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {player.name ?? "Anonymous"}
                        {player.role === "admin" && (
                          <span className="ml-1 text-xs text-primary">(Admin)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{player.email}</p>
                    </div>
                  </div>
                  {/* Mobile: inline stats */}
                  <div className="flex sm:hidden gap-3 text-xs text-muted-foreground pl-9">
                    <span>Score: <b className="text-foreground">{player.score}</b></span>
                    <span>{player.wins}W / {player.losses}L</span>
                    <span>Streak: {player.currentStreak}</span>
                  </div>
                  {/* Mobile: Revoke button */}
                  <div className="flex sm:hidden justify-end pl-9">
                    {isCurrentUser ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => signOut()}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <LogOut className="h-3 w-3 mr-1" />
                        Logout
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeSession(player.id, player.name || player.email || 'Unknown')}
                        disabled={revokingUserId === player.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Ban className="h-3 w-3 mr-1" />
                        {revokingUserId === player.id ? '...' : 'Revoke'}
                      </Button>
                    )}
                  </div>
                  {/* Desktop columns */}
                  <p className="hidden sm:block text-sm font-bold">{player.score}</p>
                  <p className="hidden sm:block text-sm text-green-500">{player.wins}</p>
                  <p className="hidden sm:block text-sm text-red-500">{player.losses}</p>
                  <p className="hidden sm:block text-sm">{player.currentStreak}/{player.bestStreak}</p>
                  <p className="hidden sm:block text-sm text-muted-foreground">{player.gamesPlayed}</p>
                  <div className="hidden sm:block">
                    {isCurrentUser ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => signOut()}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <LogOut className="h-3 w-3 mr-1" />
                        Logout
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeSession(player.id, player.name || player.email || 'Unknown')}
                        disabled={revokingUserId === player.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Ban className="h-3 w-3 mr-1" />
                        {revokingUserId === player.id ? 'Revoking...' : 'Revoke'}
                      </Button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button variant="outline" size="icon" disabled={page === data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      </div>
    </PageTransition>
  );
}
