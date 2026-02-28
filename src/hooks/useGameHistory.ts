"use client";

import { useQuery } from "@tanstack/react-query";
import { gameApi } from "@/lib/api";

interface UseGameHistoryProps {
  page?: number;
  limit?: number;
}

export function useGameHistory({ page = 1, limit = 10 }: UseGameHistoryProps = {}) {
  return useQuery({
    queryKey: ["gameHistory", page, limit],
    queryFn: () => gameApi.getHistory(page, limit),
    staleTime: 30_000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
  });
}
