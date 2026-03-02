"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface AnimatedParticlesProps {
  count?: number;
  className?: string;
}

export function AnimatedParticles({ count = 15, className = "" }: AnimatedParticlesProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        width: (i % 3) + 1,
        height: ((i * 2) % 3) + 1,
        left: (i * 13) % 100,
        top: (i * 29) % 100,
        duration: ((i % 3) + 2),
        delay: (i % 4) * 0.5,
      })),
    [count]
  );

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
