import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <div className={cn("transition-opacity duration-200", isPending && "opacity-70")}>
      {children}
    </div>
  );
}
