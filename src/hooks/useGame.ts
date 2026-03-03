"use client";

import { useCallback, useEffect } from "react";
import { logDev } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGameStore } from "@/lib/game/store";
import { useShallow } from "zustand/react/shallow";
import { gameApi } from "@/lib/api";
import { ANIMATION_DURATIONS } from "@/constants";
import type { Board, GameResult } from "@/lib/game/logic";
import { getBotMessage } from "@/lib/game/bot-messages";
import { getRuntimeConfig } from "@/lib/config";
import type { UserStats } from "@/types/user";

export function useGame() {
  const queryClient = useQueryClient();
  const {
    board,
    humanPlayer,
    aiPlayer,
    difficulty,
    gridSize,
    isAiThinking,
    gameResult,
    winningLine,
    moves,
    resultSaved,
    currentStreak,
    gameSessionId,
    addMove,
    setBoard,
    setIsAiThinking,
    setCurrentTurn,
    setGameResult,
    setWinningLine,
    setBotMessage,
    endGame,
    stopTurnTimer,
    startTurnTimer,
    setResultSaved,
    setCurrentStreak,
    setBonusAwarded,
  } = useGameStore(
    useShallow((state) => ({
      board: state.board,
      humanPlayer: state.humanPlayer,
      aiPlayer: state.aiPlayer,
      difficulty: state.difficulty,
      gridSize: state.gridSize,
      isAiThinking: state.isAiThinking,
      gameResult: state.gameResult,
      winningLine: state.winningLine,
      moves: state.moves,
      resultSaved: state.resultSaved,
      currentStreak: state.currentStreak,
      gameSessionId: state.gameSessionId,
      addMove: state.addMove,
      setBoard: state.setBoard,
      setIsAiThinking: state.setIsAiThinking,
      setCurrentTurn: state.setCurrentTurn,
      setGameResult: state.setGameResult,
      setWinningLine: state.setWinningLine,
      setBotMessage: state.setBotMessage,
      endGame: state.endGame,
      stopTurnTimer: state.stopTurnTimer,
      startTurnTimer: state.startTurnTimer,
      setResultSaved: state.setResultSaved,
      setCurrentStreak: state.setCurrentStreak,
      setBonusAwarded: state.setBonusAwarded,
    }))
  );

  const moveMutation = useMutation({
    mutationFn: (cellIndex: number) => 
      gameApi.makeMove({
        cellIndex,
        board,
        difficulty,
        humanPlayer,
        aiPlayer,
        gridSize,
      }),
    retry: 1,
    retryDelay: 1000,
  });

  // Save game result mutation
  const saveResultMutation = useMutation({
    mutationFn: (data: {
      result: "win" | "loss" | "draw";
      difficulty: string;
      moves: number[];
      duration: number;
      gridSize: string;
      finalBoard: (string | null)[];
      gameSessionId: string;
      humanPlayer: string;
    }) => gameApi.saveResult(data),
    retry: 0,
  });

  // Function to save game result
  const saveGameResult = useCallback(async (result: GameResult) => {
    const { gameStartTime } = useGameStore.getState();
    const duration = gameStartTime
      ? Math.max(1, Math.floor((Date.now() - gameStartTime) / 1000))
      : 0;

    logDev("🎮 saveGameResult called:", { result, resultSaved, difficulty, moves, duration });
    
    if (resultSaved || !result) {
      logDev("❌ Skipping save - result already saved or no result");
      return; // Prevent duplicate calls
    }
    
    // Calculate streak locally to update UI immediately
    let newStreak = currentStreak;
    let newBonusAwarded = false;
    
    if (result === "win") {
      newStreak = currentStreak + 1;
      if (newStreak === 3) {
        newBonusAwarded = true;
        // The server will reset the streak after 3 wins, so we should too
        // But we wait to do it until after the API call to show the bonus message
      }
      setCurrentStreak(newStreak);
      setBonusAwarded(newBonusAwarded);
    } else if (result === "loss") {
      newStreak = 0;
      setCurrentStreak(0);
      setBonusAwarded(false);
    } else {
      setBonusAwarded(false);
    }
    
    // Set flag immediately to prevent duplicates
    setResultSaved(true);
    
    try {
      logDev("📤 Calling save result API...", {
        result,
        difficulty,
        moves,
        duration,
        gridSize,
        finalBoard: board,
        gameSessionId,
        humanPlayer,
      });
      const response = await saveResultMutation.mutateAsync({
        result,
        difficulty,
        moves,
        duration,
        gridSize,
        finalBoard: board,
        gameSessionId,
        humanPlayer,
      }) as any;
      logDev("✅ Save result successful", response);
      
      // Update with real streak from server if available
      // The server resets streak after 3 wins, so we need to capture that
      // But only sync if we didn't just award a bonus (to avoid UI flicker)
      if (response && response.currentStreak !== undefined && !newBonusAwarded) {
        setCurrentStreak(response.currentStreak);
      }
      
      // Invalidate user stats query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      logDev("🔄 User stats query invalidated");
      
      // Optimistically update stats
      queryClient.setQueryData<UserStats>(["userStats"], (oldStats) => {
        if (!oldStats) return oldStats;
        
        const updatedStats = { ...oldStats };
        
        if (result === "win") {
          updatedStats.wins += 1;
          updatedStats.score += 1;
          // Apply streak bonus immediately in UI if applicable
          if (newBonusAwarded) {
            updatedStats.score += 1;
          }
          updatedStats.currentStreak = (updatedStats.currentStreak || 0) + 1;
        } else if (result === "loss") {
          updatedStats.losses += 1;
          updatedStats.score = Math.max(0, updatedStats.score - 1);
          updatedStats.currentStreak = 0;
        } else {
          updatedStats.draws += 1;
        }
        
        updatedStats.gamesPlayed += 1;
        logDev("⚡ Optimistically updated user stats via React Query:", updatedStats);
        
        return updatedStats;
      });

      // Refresh leaderboard/history views when results change
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["gameHistory"] });

      // Clear admin cache to ensure updated scores on next open
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith("admin_players_")) {
            localStorage.removeItem(key);
          }
        });
        window.dispatchEvent(new Event("adminPlayersInvalidate"));
      }
    } catch (error) {
      logDev("❌ Failed to save game result:", error);
      // Reset flag on error so it can be retried
      setResultSaved(false);
    }
  }, [resultSaved, difficulty, moves, board, gridSize, gameSessionId, humanPlayer, saveResultMutation, setResultSaved, queryClient, currentStreak, setCurrentStreak, setBonusAwarded]);

  const handleTimeExpired = useCallback(() => {
    // Note: Store's handleTimeExpired handles the state updates
    const state = useGameStore.getState();
    if (state.gameResult && !state.resultSaved) {
      // If the timeout caused a game over (e.g. human timeout -> bot random move -> bot wins),
      // we need to save the result.
      saveGameResult(state.gameResult);
    }
  }, [saveGameResult]);

  // We need to call handleTimeExpired when gameResult changes if it was caused by a timeout
  // But actually, we can just use an effect to watch gameResult and resultSaved
  useEffect(() => {
    const state = useGameStore.getState();
    if (gameResult && !resultSaved && state.gameDuration > 0) {
      saveGameResult(gameResult);
    }
  }, [gameResult, resultSaved, saveGameResult]);

  const makeMove = useCallback(
    async (cellIndex: number) => {
      if (board[cellIndex] !== null || isAiThinking || gameResult !== null) {
        return;
      }

      // Stop timer when player makes a move
      stopTurnTimer();

      try {
        const data = await moveMutation.mutateAsync(cellIndex) as {
          boardAfterPlayer: (string | null)[];
          botMessage?: string;
          gameResult?: string;
          winningLine?: number[];
          aiMove: number;
          boardAfterAI: (string | null)[];
          botMessageAfterAI?: string;
          gameResultAfterAI?: string;
          winningLineAfterAI?: number[];
        };

        // Update player move
        addMove(cellIndex);
        setBoard(data.boardAfterPlayer as Board);
        setBotMessage(data.botMessage || "");

        // Check for game over after player move
        if (data.gameResult) {
          setGameResult(data.gameResult as GameResult);
          setWinningLine(data.winningLine || null);
          endGame(); // Calculate duration FIRST
          // Save result after game ends
          await saveGameResult(data.gameResult as GameResult);
          return;
        }

        // AI move
        setIsAiThinking(true);
        setCurrentTurn(aiPlayer);

        // Show thinking message
        setBotMessage(getBotMessage("thinking"));

        // Start bot's turn timer
        startTurnTimer();

        // Get bot thinking time from runtime config
        const config = getRuntimeConfig();
        let thinkingTime = config.BOT_THINKING[difficulty.toUpperCase() as keyof typeof config.BOT_THINKING];
        
        // Ensure thinking time does not exceed turn timer max
        const maxTurnTime = config.TURN_TIMER[difficulty.toUpperCase() as keyof typeof config.TURN_TIMER] * 1000;
        if (thinkingTime > maxTurnTime) {
          thinkingTime = maxTurnTime;
        }

        let timeExpired = false;

        // Check every 100ms if bot timed out
        const startTime = Date.now();
        while (Date.now() - startTime < thinkingTime) {
          // Check if game state changed to human turn (meaning timeout occurred)
          const state = useGameStore.getState();
          if (state.currentTurn === humanPlayer) {
            timeExpired = true;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // If time expired, do not apply AI move, just exit
        if (timeExpired) {
          return;
        }

        // Apply AI move
        stopTurnTimer();
        addMove(data.aiMove);
        setBoard(data.boardAfterAI as Board);
        setBotMessage(data.botMessageAfterAI || "");
        setIsAiThinking(false);
        setCurrentTurn(humanPlayer);

        // Check for game over after AI move
        if (data.gameResultAfterAI) {
          setGameResult(data.gameResultAfterAI as GameResult);
          setWinningLine(data.winningLineAfterAI || null);
          endGame(); // Calculate duration FIRST
          // Save result after game ends
          await saveGameResult(data.gameResultAfterAI as GameResult);
        }
      } catch (error) {
        logDev("Failed to make move:", error);
      }
    },
    [
      board,
      humanPlayer,
      aiPlayer,
      difficulty,
      isAiThinking,
      gameResult,
      addMove,
      setBoard,
      setIsAiThinking,
      setCurrentTurn,
      setGameResult,
      setWinningLine,
      setBotMessage,
      endGame,
      stopTurnTimer,
      startTurnTimer,
      saveGameResult,
      moveMutation,
    ]
  );

  return {
    board,
    humanPlayer,
    aiPlayer,
    difficulty,
    gridSize,
    isAiThinking: isAiThinking || moveMutation.isPending,
    gameResult,
    winningLine,
    makeMove,
    isLoading: moveMutation.isPending,
    error: moveMutation.error,
  };
}
