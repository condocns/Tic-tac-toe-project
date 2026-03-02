"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Gamepad2, Trophy, History, Shield, LogOut, Menu, X, Home, User, BarChart3, Clock, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { UserRole } from "@prisma/client";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-purple-400/20 bg-purple-900/80 backdrop-blur-lg shadow-lg shadow-purple-500/10"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <motion.div 
          className="flex items-center gap-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link href="/" className="group flex items-center gap-3 font-bold text-xl transition-all duration-200">
            <motion.div 
              className="p-2 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-600/20 group-hover:from-purple-600/40 group-hover:to-pink-600/30 transition-all duration-200 shadow-lg shadow-purple-500/20"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gamepad2 className="h-6 w-6 text-purple-300" />
            </motion.div>
            <div className="flex flex-col">
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Tic-Tac-Toe
              </motion.span>
              <span className="text-xs text-purple-200/70 hidden md:block">
                Challenge the AI
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        {session && (
          <motion.div 
            className="hidden xl:flex items-center gap-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-purple-200/70 hover:text-purple-100 hover:bg-purple-500/20 transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                <span className="hidden xl:inline">Home</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/game" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-purple-200/70 hover:text-purple-100 hover:bg-purple-500/20 transition-all duration-200"
              >
                <Gamepad2 className="h-4 w-4" />
                <span className="hidden xl:inline">Play</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/leaderboard" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-purple-200/70 hover:text-purple-100 hover:bg-purple-500/20 transition-all duration-200"
              >
                <Trophy className="h-4 w-4" />
                <span className="hidden xl:inline">Leaderboard</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/history" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-purple-200/70 hover:text-purple-100 hover:bg-purple-500/20 transition-all duration-200"
              >
                <History className="h-4 w-4" />
                <span className="hidden xl:inline">History</span>
              </Link>
            </motion.div>
            {session.user.role === UserRole.ADMIN && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-purple-200/70 hover:text-purple-100 hover:bg-purple-500/20 transition-all duration-200"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden xl:inline">Admin</span>
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Tablet Navigation */}
        {session && (
          <motion.div 
            className="hidden md:flex xl:hidden items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/game" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-200/70 hover:text-purple-100 hover:bg-purple-500/20 transition-all duration-200"
              >
                <Gamepad2 className="h-4 w-4" />
                <span className="hidden sm:inline">Play</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/leaderboard" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-200/70 hover:text-purple-100 hover:bg-purple-500/20 transition-all duration-200"
              >
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* Right Section */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ThemeToggle />
          
          {session ? (
            <>
              {/* User Profile */}
              <motion.div 
                className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-200 border border-purple-400/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Avatar className="h-8 w-8 ring-2 ring-purple-400/30">
                  <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-sm font-semibold">
                    {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col">
                  <span className="text-sm font-semibold text-purple-100">{session.user.name}</span>
                  <span className="text-xs text-purple-200/70 flex items-center gap-1">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-green-400"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="hidden sm:inline">Online</span>
                  </span>
                </div>
                <div className="flex lg:hidden flex items-center gap-2">
                  <span className="text-sm font-semibold text-purple-100">{session.user.name}</span>
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-green-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
              
              {/* Sign Out Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-purple-200/70"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Sign Out</span>
                </Button>
              </motion.div>
              
              {/* Mobile Menu Toggle */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-10 w-10 rounded-lg hover:bg-purple-500/20 transition-all duration-200 text-purple-200/70"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </motion.div>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login">
                <Button size="sm" className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-lg shadow-purple-500/25">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: mobileMenuOpen && session ? "auto" : 0, opacity: mobileMenuOpen && session ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden border-t border-purple-400/20 bg-purple-900/80 backdrop-blur-lg overflow-hidden"
      >
        {mobileMenuOpen && session && (
          <div className="container px-4 py-6 space-y-2">
            {/* Navigation Links */}
            <div className="space-y-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-500/20 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5 text-purple-300" />
                  <div className="flex flex-col">
                    <span className="font-medium text-purple-100">Home</span>
                    <span className="text-xs text-purple-200/70">Main page</span>
                  </div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/game"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-500/20 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Gamepad2 className="h-5 w-5 text-purple-300" />
                  <div className="flex flex-col">
                    <span className="font-medium text-purple-100">Play Game</span>
                    <span className="text-xs text-purple-200/70">Start playing</span>
                  </div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/leaderboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-500/20 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Trophy className="h-5 w-5 text-purple-300" />
                  <div className="flex flex-col">
                    <span className="font-medium text-purple-100">Leaderboard</span>
                    <span className="text-xs text-purple-200/70">Top players</span>
                  </div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/history"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-500/20 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <History className="h-5 w-5 text-purple-300" />
                  <div className="flex flex-col">
                    <span className="font-medium text-purple-100">Match History</span>
                    <span className="text-xs text-purple-200/70">Your games</span>
                  </div>
                </Link>
              </motion.div>
              {session.user.role === UserRole.ADMIN && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-500/20 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-5 w-5 text-purple-300" />
                    <div className="flex flex-col">
                      <span className="font-medium text-purple-100">Admin</span>
                      <span className="text-xs text-purple-200/70">Dashboard</span>
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>
            
            {/* Mobile User Profile */}
            <div className="border-t border-purple-400/20 pt-4 mt-4">
              <motion.div 
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-400/20"
                whileHover={{ scale: 1.02 }}
              >
                <Avatar className="h-10 w-10 ring-2 ring-purple-400/30">
                  <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-lg font-semibold">
                    {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-purple-100">{session.user.name}</span>
                  <span className="text-sm text-purple-200/70 flex items-center gap-1">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-green-400"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    Online
                  </span>
                </div>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full mt-3 border-purple-400/30 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.nav>
  );
}
