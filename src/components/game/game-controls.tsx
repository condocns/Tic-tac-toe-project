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
    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 space-y-6">
      {/* Difficulty selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Swords className="h-4 w-4" />
          Difficulty Level
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={difficulty === "easy" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDifficultyChange("easy")}
            className={cn("transition-all duration-200", difficulty === "easy" && "shadow-lg")}
          >
            Easy
          </Button>
          <Button
            variant={difficulty === "medium" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDifficultyChange("medium")}
            className={cn("transition-all duration-200", difficulty === "medium" && "shadow-lg")}
          >
            Medium
          </Button>
          <Button
            variant={difficulty === "hard" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDifficultyChange("hard")}
            className={cn("transition-all duration-200", difficulty === "hard" && "shadow-lg")}
          >
            Hard
          </Button>
        </div>
      </div>

      {/* Grid selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Grid3x3 className="h-4 w-4" />
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
            <Swords className="mr-2 h-5 w-5" />
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
