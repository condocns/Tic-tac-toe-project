"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedParticlesProps {
  count?: number;
  className?: string;
}

export function AnimatedParticles({ count = 15, className = "" }: AnimatedParticlesProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    width: number;
    height: number;
    left: number;
    top: number;
    duration: number;
    delay: number;
  }>>([]);

  // 2026 Standard: Generate particles only on client after mount
  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, [count]);

  // Don't render on server to prevent hydration mismatch
  if (particles.length === 0) {
    return <div className={`absolute inset-0 ${className}`} />;
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-white rounded-full opacity-10"
          style={{
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}
