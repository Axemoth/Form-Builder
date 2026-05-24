"use client";

import { cn } from "~/lib/utils";

interface WaveDividerProps {
  flip?: boolean;
  color?: string; // Fill color class
  className?: string;
}

export function WaveDivider({
  flip = false,
  color = "fill-ocean-deep",
  className,
}: WaveDividerProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden pointer-events-none select-none relative z-20 h-12 md:h-16",
        flip && "rotate-180",
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full min-w-[1000px]"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 C240,30 480,10 720,25 C960,40 1200,10 1440,0 L1440,40 L0,40 Z"
          className={color}
        />
      </svg>
    </div>
  );
}
