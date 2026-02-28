"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/lib/game/store";

export function useTurnTimer() {
  const {
    currentTurn,
    humanPlayer,
    isAiThinking,
    gameResult,
    turnStartTime,
    timeRemaining,
    isTimerActive,
    startTurnTimer,
    stopTurnTimer,
    updateTimeRemaining,
    handleTimeExpired,
  } = useGameStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer when it's human's turn
  useEffect(() => {
    if (currentTurn === humanPlayer && !isAiThinking && !gameResult && !turnStartTime) {
      startTurnTimer();
    } else if (currentTurn !== humanPlayer || isAiThinking || gameResult) {
      stopTurnTimer();
    }
  }, [currentTurn, humanPlayer, isAiThinking, gameResult, turnStartTime, startTurnTimer, stopTurnTimer]);

  // Timer countdown logic
  useEffect(() => {
    if (isTimerActive && turnStartTime) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - turnStartTime) / 1000);
        const remaining = Math.max(0, timeRemaining - elapsed);
        
        updateTimeRemaining(remaining);
        
        if (remaining === 0) {
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
