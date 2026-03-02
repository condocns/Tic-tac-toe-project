"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { pageTransitionMotion, pageTransitionTransition, reducedMotionTransition } from "@/lib/motion";

interface NavigationLoadingProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

export function NavigationLoading({ isLoading, children }: NavigationLoadingProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

// For page transitions
export function PageTransition({ children, isPending }: { 
  children: React.ReactNode; 
  isPending?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion ? reducedMotionTransition : pageTransitionTransition;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={pageTransitionMotion.initial}
        animate={pageTransitionMotion.animate}
        transition={transition}
        className={cn("will-change-transform", isPending && "opacity-70")}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
