"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggle} 
        aria-label="Toggle theme"
        className="relative overflow-hidden bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/20 text-purple-200/70 hover:text-purple-100 transition-all duration-200"
      >
        <motion.div
          key={dark ? "dark" : "light"}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {dark ? (
            <div className="relative">
              <Sun className="h-4 w-4" />
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-3 w-3 text-yellow-300/50" />
              </motion.div>
            </div>
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
}
