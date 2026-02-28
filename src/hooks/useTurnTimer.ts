"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/lib/game/store";
import { TURN_TIMER } from "@/constants";

export function useTurnTimer() {
  const {
    currentTurn,
    humanPlayer,
    isAiThinking,
    gameResult,
    turnStartTime,
    timeRemaining,
    isTimerActive,
    board,
    startTurnTimer,
    stopTurnTimer,
    updateTimeRemaining,
    handleTimeExpired,
  } = useGameStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer when it's human's turn AND game is ready
  useEffect(() => {
    // Only start timer if:
    // 1. It's human's turn
    // 2. AI is not thinking
    // 3. No game result
    // 4. Timer hasn't started yet
    // 5. Game has actually started (board is not empty or first move has been made)
    const gameHasStarted = board.some((cell: string | null) => cell !== null) || turnStartTime !== null;
    
    if (currentTurn === humanPlayer && !isAiThinking && !gameResult && !turnStartTime && gameHasStarted) {
      startTurnTimer();
    } else if (currentTurn !== humanPlayer || isAiThinking || gameResult) {
      stopTurnTimer();
    }
  }, [currentTurn, humanPlayer, isAiThinking, gameResult, turnStartTime, startTurnTimer, stopTurnTimer, board]);

  // Timer countdown logic
  useEffect(() => {
    if (isTimerActive && turnStartTime) {
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - turnStartTime) / 1000;
        const remaining = Math.max(0, timeRemaining - elapsed);
        
        // Update with decimal for smooth progress
        updateTimeRemaining(remaining);
        
        if (remaining <= 0) {
          handleTimeExpired();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 100); // Update every 100ms for smooth countdown

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isTimerActive, turnStartTime, timeRemaining, updateTimeRemaining, handleTimeExpired]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeRemaining,
    isTimerActive,
    isHumanTurn: currentTurn === humanPlayer && !isAiThinking,
  };
}
