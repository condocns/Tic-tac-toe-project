"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GameBoard } from "@/components/game/game-board";
import { GameInfo } from "@/components/game/game-info";
import { GameControls } from "@/components/game/game-controls";
import { TurnTimer } from "@/components/game/turn-timer";
import { useGameStore } from "@/lib/game/store";
import { getBotMessage } from "@/lib/game/bot-messages";

export default function GamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { resetGame, startGame, setBotMessage } = useGameStore();
  const [isChecking, setIsChecking] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    resetGame();
    startGame();
    setBotMessage(getBotMessage("game_start"));
  }, [resetGame, startGame, setBotMessage]);

  useEffect(() => {
    // รอสักครู่ให้ session โหลดเสร็จ
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (status === "loading" || isChecking || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!session) {
    router.push("/login?callbackUrl=/game");
    return null;
  }

  return (
    <div className="px-4 py-8">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-10"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg shadow-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400/30"
          >
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">0</div>
            <div className="text-sm text-purple-700/70 dark:text-purple-200/70">Wins</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg shadow-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400/30"
          >
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">0</div>
            <div className="text-sm text-purple-700/70 dark:text-purple-200/70">Losses</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg shadow-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400/30"
          >
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">0</div>
            <div className="text-sm text-purple-700/70 dark:text-purple-200/70">Draws</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-purple-200/30 border-purple-400/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg shadow-purple-500/20 dark:bg-purple-500/20 dark:border-purple-400/30"
          >
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-100">0</div>
            <div className="text-sm text-purple-700/70 dark:text-purple-200/70">Points</div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
