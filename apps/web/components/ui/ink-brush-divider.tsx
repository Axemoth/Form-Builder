"use client";

import { cn } from "~/lib/utils";

interface InkBrushDividerProps {
  color?: string; // Tailwind class name or raw color
  className?: string;
  variant?: "thin" | "thick";
}

export function InkBrushDivider({
  color = "bg-wano-crimson",
  className,
  variant = "thin",
}: InkBrushDividerProps) {
  return (
    <div
      className={cn(
        "relative w-full flex items-center justify-center py-4 overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "w-full max-w-5xl rounded-full opacity-80",
          variant === "thin" ? "h-[2px]" : "h-[4px]",
          color,
          // Apply custom brush look with gradients
          "bg-gradient-to-r from-transparent via-current to-transparent",
        )}
        style={{
          // Use CSS clip path to give it a rough, organic ink look
          clipPath:
            "polygon(0% 45%, 10% 50%, 25% 40%, 40% 60%, 55% 45%, 70% 55%, 85% 40%, 100% 50%, 95% 60%, 80% 45%, 65% 55%, 50% 40%, 35% 60%, 20% 45%, 5% 55%)",
        }}
      />
      {/* Decorative ink blots */}
      <span
        className={cn("absolute left-[20%] w-1.5 h-1 rounded-full opacity-60", color)}
        style={{ transform: "rotate(15deg)" }}
      />
      <span
        className={cn("absolute right-[35%] w-1 h-1.5 rounded-full opacity-50", color)}
        style={{ transform: "rotate(-25deg)" }}
      />
    </div>
  );
}
