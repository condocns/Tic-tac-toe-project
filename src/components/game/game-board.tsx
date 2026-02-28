"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/useGame";
import { cn } from "@/lib/utils";
import { BOARD_CONFIGS } from "@/constants";

// Helper functions for winning line visualization
function getWinningLineStyle(winningLine: number[] | null, gridSize: string): string {
  if (!winningLine) return "w-full h-1.5";
  
  const gridCols = gridSize === "3x3" ? 3 : gridSize === "4x4" ? 4 : 5;
  const firstIndex = winningLine[0];
  const secondIndex = winningLine[1];
  
  // Check if horizontal (same row)
  if (Math.floor(firstIndex / gridCols) === Math.floor(secondIndex / gridCols)) {
    return "w-full h-1.5";
  }
  // Check if vertical (same column)
  else if (firstIndex % gridCols === secondIndex % gridCols) {
    return "w-1.5 h-full";
  }
  // Diagonal
  else {
    return "w-full h-1.5";
  }
}

function getWinningLineTransform(winningLine: number[] | null, gridSize: string): React.CSSProperties {
  if (!winningLine) return {};
  
  const gridCols = gridSize === "3x3" ? 3 : gridSize === "4x4" ? 4 : 5;
  const firstIndex = winningLine[0];
  const secondIndex = winningLine[1];
  
  // Check if horizontal (same row)
  if (Math.floor(firstIndex / gridCols) === Math.floor(secondIndex / gridCols)) {
    return {};
  }
  // Check if vertical (same column)
  else if (firstIndex % gridCols === secondIndex % gridCols) {
    return {};
  }
  // Diagonal - determine direction
  else {
    // Top-left to bottom-right diagonal
    if (secondIndex - firstIndex === gridCols + 1) {
      return { transform: 'rotate(45deg)' };
    }
    // Top-right to bottom-left diagonal
    else {
      return { transform: 'rotate(-45deg)' };
    }
  }
}

export function GameBoard() {
  const { board, makeMove, winningLine, isAiThinking, gameResult, humanPlayer, gridSize } = useGame();
  
  const gridConfig = BOARD_CONFIGS[gridSize as keyof typeof BOARD_CONFIGS];
  
  // Use CSS Grid with dynamic columns instead of Tailwind classes
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
    gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
    gap: '0.5rem',
    width: '100%',
    height: '100%',
    padding: '0.5rem',
    minHeight: '280px', // Ensure minimum height for larger grids
  } as const;

  // Adjust font size based on grid size
  const getFontSize = () => {
    switch (gridSize) {
      case '3x3': return 'text-3xl sm:text-4xl md:text-5xl';
      case '4x4': return 'text-2xl sm:text-3xl md:text-4xl';
      case '5x5': return 'text-xl sm:text-2xl md:text-3xl';
      default: return 'text-3xl sm:text-4xl md:text-5xl';
    }
  };

  return (
    <div className="relative">
      <div 
        style={gridStyle}
        className="max-w-[350px] sm:max-w-[400px] mx-auto aspect-square"
      >
        {board.map((cell, index) => {
          const isWinningCell = winningLine?.includes(index);
          const winningLineIndex = winningLine?.indexOf(index);
          const isWinningLineStart = winningLineIndex === 0;
          const isWinningLineEnd = winningLineIndex === winningLine?.length! - 1;

          return (
            <motion.button
              key={index}
              className={cn(
                "relative flex items-center justify-center rounded-xl border-2 bg-card/80 backdrop-blur-sm text-card-foreground shadow-sm",
                getFontSize(),
                "font-bold",
                "transition-all duration-300",
                "aspect-square",
                cell === null && !isAiThinking && !gameResult
                  ? "hover:bg-accent/80 hover:border-primary/60 hover:shadow-lg cursor-pointer hover:scale-105"
                  : "cursor-default",
                isWinningCell && "border-primary bg-primary/20 shadow-lg",
                !isWinningCell && "border-border/60 hover:border-border"
              )}
              onClick={() => makeMove(index)}
              whileHover={
                cell === null && !isAiThinking && !gameResult
                  ? { scale: 1.05, y: -2 }
                  : {}
              }
              whileTap={
                cell === null && !isAiThinking && !gameResult
                  ? { scale: 0.95, y: 0 }
                  : {}
              }
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <motion.span
                    key={`${index}-${cell}`}
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 180, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={cn(
                      cell === humanPlayer ? "text-blue-500 drop-shadow-sm" : "text-red-500 drop-shadow-sm",
                      isWinningCell && "drop-shadow-lg scale-110"
                    )}
                  >
                    {cell}
                  </motion.span>
                )}
                {isWinningCell && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div 
                      className={cn(
                        "bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-lg",
                        getWinningLineStyle(winningLine, gridSize)
                      )}
                      style={getWinningLineTransform(winningLine, gridSize)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

