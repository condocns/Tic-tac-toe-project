"use client";

import { useGameStore } from "@/lib/game/store";
import { Button } from "@/components/ui/button";
import { RotateCcw, Swords, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBotMessage } from "@/lib/game/bot-messages";
import { DIFFICULTY_GRID_CONFIGS, type GridSize } from "@/constants";

export function GameControls() {
  const { difficulty, setDifficulty, gridSize, setGridSize, resetGame, gameResult, setBotMessage, startGame } =
    useGameStore();

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
    <div className="flex flex-col items-center gap-4 w-full max-w-[380px] mx-auto">
      {/* Difficulty selector */}
      <div className="flex items-center gap-2 w-full">
        <span className="text-sm font-medium text-muted-foreground mr-1">Difficulty:</span>
        <Button
          variant={difficulty === "easy" ? "default" : "outline"}
          size="sm"
          onClick={() => handleDifficultyChange("easy")}
          className={cn("flex-1")}
        >
          Easy
        </Button>
        <Button
          variant={difficulty === "medium" ? "default" : "outline"}
          size="sm"
          onClick={() => handleDifficultyChange("medium")}
          className={cn("flex-1")}
        >
          Medium
        </Button>
        <Button
          variant={difficulty === "hard" ? "default" : "outline"}
          size="sm"
          onClick={() => handleDifficultyChange("hard")}
          className={cn("flex-1")}
        >
          Hard
        </Button>
      </div>

      {/* Grid selector */}
      <div className="flex items-center gap-2 w-full">
        <span className="text-sm font-medium text-muted-foreground mr-1">Grid:</span>
        {availableGridSizes.map((size) => (
          <Button
            key={size}
            variant={gridSize === size ? "default" : "outline"}
            size="sm"
            onClick={() => handleGridSizeChange(size)}
            className={cn("flex-1")}
          >
            <Grid3x3 className="mr-1 h-3 w-3" />
            {size}
          </Button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 w-full">
        {gameResult ? (
          <Button onClick={handleNewGame} className="flex-1" size="lg">
            <Swords className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        ) : (
          <Button variant="outline" onClick={handleNewGame} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Game
          </Button>
        )}
      </div>
    </div>
  );
}
