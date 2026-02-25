"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkWinner, type Board, type Player } from "@/lib/game/logic";

interface MatchReplayProps {
  moves: number[];
  onClose?: () => void;
}

export function MatchReplay({ moves, onClose }: MatchReplayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [winLine, setWinLine] = useState<number[] | null>(null);

  const buildBoard = useCallback(
    (step: number): Board => {
      const b: Board = Array(9).fill(null);
      for (let i = 0; i < step; i++) {
        b[moves[i]] = i % 2 === 0 ? "X" : "O";
      }
      return b;
    },
    [moves]
  );

  useEffect(() => {
    const newBoard = buildBoard(currentStep);
    setBoard(newBoard);
    const { line } = checkWinner(newBoard);
    setWinLine(line);
  }, [currentStep, buildBoard]);

  useEffect(() => {
    if (!isPlaying || currentStep >= moves.length) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), 600);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, moves.length]);

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setWinLine(null);
  };

  const skipToEnd = () => {
    setCurrentStep(moves.length);
    setIsPlaying(false);
  };

  const getCellPlayer = (index: number): Player | null => board[index];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1.5 w-full max-w-[240px] mx-auto aspect-square">
        {board.map((cell, index) => {
          const isWin = winLine?.includes(index);
          return (
            <div
              key={index}
              className={cn(
                "flex items-center justify-center rounded-lg border text-xl font-bold",
                isWin ? "border-primary bg-primary/10" : "border-border bg-card"
              )}
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <motion.span
                    key={`${index}-${cell}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      cell === "X" ? "text-blue-500" : "text-red-500"
                    )}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={reset} className="h-8 w-8">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={currentStep >= moves.length}
          className="h-8 w-8"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="outline" size="icon" onClick={skipToEnd} className="h-8 w-8">
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Move {currentStep} / {moves.length}
      </p>

      {onClose && (
        <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
          Close Replay
        </Button>
      )}
    </div>
  );
}
