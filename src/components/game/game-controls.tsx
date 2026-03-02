"use client";

import { useGameStore } from "@/lib/game/store";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Grid3x3, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBotMessage } from "@/lib/game/bot-messages";
import { DIFFICULTY_GRID_CONFIGS, type GridSize } from "@/constants";

export function GameControls() {
  const { difficulty, setDifficulty, gridSize, setGridSize, resetGame, gameResult, setBotMessage, startGame } =
    useGameStore(
      useShallow((state) => ({
        difficulty: state.difficulty,
        setDifficulty: state.setDifficulty,
        gridSize: state.gridSize,
        setGridSize: state.setGridSize,
        resetGame: state.resetGame,
        gameResult: state.gameResult,
        setBotMessage: state.setBotMessage,
        startGame: state.startGame,
      }))
    );

  const handleNewGame = () => {
    resetGame();
    startGame();
    setBotMessage(getBotMessage("game_start"));
  };

  const handleDifficultyChange = (diff: "easy" | "medium" | "hard") => {
    setDifficulty(diff);
    handleNewGame();
  };

  const handleGridSizeChange = (size: GridSize) => {
    setGridSize(size);
    handleNewGame();
  };

  const availableGridSizes = DIFFICULTY_GRID_CONFIGS[difficulty];

  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50 space-y-6 shadow-sm">
      {/* Difficulty selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Zap className="h-4 w-4 text-purple-500" />
          Difficulty
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={difficulty === "easy" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDifficultyChange("easy")}
            className={cn(
              "transition-all duration-200", 
              difficulty === "easy" && "shadow-lg bg-green-600 hover:bg-green-700 text-white border-green-600"
            )}
          >
            Easy
          </Button>
          <Button
            variant={difficulty === "medium" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDifficultyChange("medium")}
            className={cn(
              "transition-all duration-200", 
              difficulty === "medium" && "shadow-lg bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
            )}
          >
            Medium
          </Button>
          <Button
            variant={difficulty === "hard" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDifficultyChange("hard")}
            className={cn(
              "transition-all duration-200", 
              difficulty === "hard" && "shadow-lg bg-red-600 hover:bg-red-700 text-white border-red-600"
            )}
          >
            Hard
          </Button>
        </div>
      </div>

      {/* Grid selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Grid3x3 className="h-4 w-4 text-blue-500" />
          Grid Size
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {availableGridSizes.map((size) => (
            <Button
              key={size}
              variant={gridSize === size ? "default" : "outline"}
              size="sm"
              onClick={() => handleGridSizeChange(size)}
              className={cn(
                "transition-all duration-200",
                gridSize === size && "shadow-lg"
              )}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Action button */}
      <div className="pt-2">
        {gameResult ? (
          <Button 
            onClick={handleNewGame} 
            className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Play Again
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={handleNewGame} 
            className="w-full h-12 border-2 hover:bg-accent transition-all duration-200"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Game
          </Button>
        )}
      </div>
    </div>
  );
}
