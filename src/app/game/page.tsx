"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { motion } from "framer-motion";
import { GameBoard } from "@/components/game/game-board";
import { GameInfo } from "@/components/game/game-info";
import { GameControls } from "@/components/game/game-controls";
import { TurnTimer } from "@/components/game/turn-timer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AnimatedParticles } from "@/components/ui/animated-particles";
import { useGameStore } from "@/lib/game/store";
import { useShallow } from "zustand/react/shallow";
import { getBotMessage } from "@/lib/game/bot-messages";
import { StatsDisplay } from "@/components/game/stats-display";

export default function GamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { resetGame, startGame, setBotMessage } = useGameStore(
    useShallow((state) => ({
      resetGame: state.resetGame,
      startGame: state.startGame,
      setBotMessage: state.setBotMessage,
    }))
  );

  // 2026 Standard: ใช้ useTransition สำหรับ non-urgent updates
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // 2026 Standard: ใช้ startTransition สำหรับ non-critical updates
    startTransition(() => {
      resetGame();
      startGame();
      setBotMessage(getBotMessage("game_start"));
    });
  }, [resetGame, startGame, setBotMessage]);

  // 2026 Standard: ตรวจสอบ session state อย่างเดียว (ไม่ต้อง mounted state)
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    // 2026 Standard: ใช้ navigate แทน router.push สำหรับ better UX
    router.replace("/login?callbackUrl=/game");
    return null;
  }

  return (
    <div className="px-4 py-8">
      {/* Enhanced animated background elements */}
      <AnimatedParticles count={15} />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent mb-2"
          >
            Tic-Tac-Toe
          </motion.h1>
          <p className="text-purple-800/80 dark:text-purple-200/80 text-lg">Challenge the AI in this classic game</p>
        </div>

        {/* Main Game Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Panel - Game Info & Timer */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400/30">
                <GameInfo />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400/30">
                <TurnTimer />
              </div>
            </motion.div>
          </div>

          {/* Center Panel - Game Board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 flex justify-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-purple-500/30 dark:bg-purple-500/20 dark:border-purple-400/30">
              <GameBoard />
            </div>
          </motion.div>

          {/* Right Panel - Game Controls */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400/30">
                <GameControls />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <StatsDisplay />
      </div>
    </div>
  );
}
