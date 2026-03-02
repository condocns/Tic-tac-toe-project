"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useGameStore } from "@/lib/game/store";
import { gameApi } from "@/lib/api";
import { ANIMATION_DURATIONS } from "@/constants";
import type { Board, GameResult } from "@/lib/game/logic";
import { getBotMessage } from "@/lib/game/bot-messages";
import { getRuntimeConfig } from "@/lib/config";

export function useGame() {
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
    addMove,
    setBoard,
    setIsAiThinking,
    setCurrentTurn,
    setGameResult,
    setWinningLine,
    setBotMessage,
    endGame,
    stopTurnTimer,
    setResultSaved,
  } = useGameStore();

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
    }) => gameApi.saveResult(data),
    retry: 0,
  });

  // Function to save game result
  const saveGameResult = useCallback(async (result: GameResult) => {
    const { gameStartTime } = useGameStore.getState();
    const duration = gameStartTime
      ? Math.max(1, Math.floor((Date.now() - gameStartTime) / 1000))
      : 0;

    console.log("🎮 saveGameResult called:", { result, resultSaved, difficulty, moves, duration });
    
    if (resultSaved || !result) {
      console.log("❌ Skipping save - result already saved or no result");
      return; // Prevent duplicate calls
    }
    
    // Set flag immediately to prevent duplicates
    setResultSaved(true);
    
    try {
      console.log("📤 Calling saveResult API...");
      await saveResultMutation.mutateAsync({
        result,
        difficulty,
        moves,
        duration,
      });
      console.log("✅ Save result successful");
    } catch (error) {
      console.error("❌ Failed to save game result:", error);
      // Reset flag on error so it can be retried
      setResultSaved(false);
    }
  }, [resultSaved, difficulty, moves, saveResultMutation, setResultSaved]);

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

        // Get bot thinking time from runtime config
        const config = getRuntimeConfig();
        const thinkingTime = config.BOT_THINKING[difficulty.toUpperCase() as keyof typeof config.BOT_THINKING];
        await new Promise((resolve) => 
          setTimeout(resolve, thinkingTime)
        );

        // Apply AI move
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
        console.error("Failed to make move:", error);
      }
    },
    [
      board,
      humanPlayer,
      aiPlayer,
      difficulty,
      gridSize,
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
      saveGameResult,
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
