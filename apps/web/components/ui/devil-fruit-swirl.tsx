"use client";

import { cn } from "~/lib/utils";

interface DevilFruitSwirlProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

export function DevilFruitSwirl({ size = 60, animate = true, className }: DevilFruitSwirlProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "relative rounded-full flex items-center justify-center overflow-hidden border border-fruit-purple/30 shadow-[0_0_15px_rgba(123,45,142,0.3)]",
        animate && "animate-swirl-pulse",
        className,
      )}
    >
      {/* Background swirl */}
      <div className="absolute inset-0 fruit-swirl opacity-80" />

      {/* Glassmorphic overlay */}
      <div className="absolute inset-[3px] rounded-full bg-ocean-mid/80 backdrop-blur-sm flex items-center justify-center border border-white/5">
        {/* Decorative inner spiral */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-2/3 h-2/3 text-wano-sakura opacity-70"
        >
          <path
            d="M50,50 C60,40 70,50 60,60 C50,70 40,55 50,45 C60,35 70,60 50,70 C30,80 30,40 50,30 C70,20 80,60 50,80 C20,100 10,40 50,15 C90,-10 90,80 50,90"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Haki Energy Flare */}
      <div className="absolute inset-0 rounded-full haki-glow opacity-25 pointer-events-none" />
    </div>
  );
}
