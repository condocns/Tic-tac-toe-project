"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Gamepad2, Trophy, History, Shield, LogOut, Menu, X, Home, User, BarChart3, Clock } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-3 font-bold text-xl transition-all duration-200 hover:scale-105">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-200">
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Tic-Tac-Toe
              </span>
              <span className="text-xs text-muted-foreground hidden md:block">
                Challenge the AI
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {session && (
          <div className="hidden xl:flex items-center gap-1">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              <span className="hidden xl:inline">Home</span>
            </Link>
            <Link 
              href="/game" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
            >
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden xl:inline">Play</span>
            </Link>
            <Link 
              href="/leaderboard" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden xl:inline">Leaderboard</span>
            </Link>
            <Link 
              href="/history" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
            >
              <History className="h-4 w-4" />
              <span className="hidden xl:inline">History</span>
            </Link>
            {session.user.role === "admin" && (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden xl:inline">Admin</span>
              </Link>
            )}
          </div>
        )}

        {/* Tablet Navigation */}
        {session && (
          <div className="hidden md:flex xl:hidden items-center gap-2">
            <Link 
              href="/game" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
            >
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden sm:inline">Play</span>
            </Link>
            <Link 
              href="/leaderboard" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {session ? (
            <>
              {/* User Profile */}
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-full bg-accent/50 hover:bg-accent/70 transition-all duration-200">
                <Avatar className="h-8 w-8 ring-2 ring-background">
                  <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col">
                  <span className="text-sm font-semibold">{session.user.name}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="hidden sm:inline">Online</span>
                  </span>
                </div>
                <div className="flex lg:hidden flex items-center gap-2">
                  <span className="text-sm font-semibold">{session.user.name}</span>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
              </div>
              
              {/* Sign Out Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </Button>
              
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 rounded-lg hover:bg-accent/50 transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="px-6 py-2 rounded-lg font-semibold">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && session && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur">
          <div className="container px-4 py-6 space-y-2">
            {/* Navigation Links */}
            <div className="space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">Home</span>
                  <span className="text-xs text-muted-foreground">Main page</span>
                </div>
              </Link>
              <Link
                href="/game"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">Play Game</span>
                  <span className="text-xs text-muted-foreground">Start playing</span>
                </div>
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">Leaderboard</span>
                  <span className="text-xs text-muted-foreground">Top players</span>
                </div>
              </Link>
              <Link
                href="/history"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <History className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">Match History</span>
                  <span className="text-xs text-muted-foreground">Your games</span>
                </div>
              </Link>
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">Dashboard</span>
                  </div>
                </Link>
              )}
            </div>
            
            {/* Mobile User Profile */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/30">
                <Avatar className="h-10 w-10 ring-2 ring-background">
                  <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                    {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold">{session.user.name}</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Online
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full mt-3"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
