"use client";

import { cn } from "~/lib/utils";

interface WaveBackgroundProps {
  position?: "top" | "bottom";
  className?: string;
}

export function WaveBackground({ position = "bottom", className }: WaveBackgroundProps) {
  return (
    <div
      className={cn(
        "absolute left-0 w-full overflow-hidden pointer-events-none select-none z-10",
        position === "bottom" ? "bottom-0" : "top-0 rotate-180",
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-12 md:h-24 min-w-[1000px]"
        preserveAspectRatio="none"
      >
        {/* Layer 3 - Background Slow Wave */}
        <path
          d="M0,96 C240,64 480,128 720,96 C960,64 1200,128 1440,96 L1440,120 L0,120 Z"
          fill="url(#wave-gradient-1)"
          className="animate-wave-slow opacity-30"
        />
        {/* Layer 2 - Mid Wave */}
        <path
          d="M0,64 C240,112 480,48 720,80 C960,112 1200,48 1440,64 L1440,120 L0,120 Z"
          fill="url(#wave-gradient-2)"
          className="animate-wave opacity-50"
        />
        {/* Layer 1 - Foreground Wave */}
        <path
          d="M0,32 C240,80 480,16 720,48 C960,80 1200,16 1440,32 L1440,120 L0,120 Z"
          fill="url(#wave-gradient-3)"
          className="animate-wave opacity-90"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A3A5C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0A1628" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F2340" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0A1628" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0A1628" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0A1628" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
