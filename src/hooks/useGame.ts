"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useGameStore } from "@/lib/game/store";
import { gameApi } from "@/lib/api";
import { ANIMATION_DURATIONS } from "@/constants";
import type { Board, GameResult } from "@/lib/game/logic";

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
    addMove,
    setBoard,
    setIsAiThinking,
    setCurrentTurn,
    setGameResult,
    setWinningLine,
    setBotMessage,
    endGame,
    stopTurnTimer,
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
          endGame();
          return;
        }

        // AI move
        setIsAiThinking(true);
        setCurrentTurn(aiPlayer);

        // Simulate AI thinking
        await new Promise((resolve) => 
          setTimeout(resolve, ANIMATION_DURATIONS.BOT_THINKING)
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
          endGame();
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
