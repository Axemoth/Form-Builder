"use client";

import { cn } from "~/lib/utils";

interface CompassLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CompassLoader({ size = "md", className }: CompassLoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeClasses[size], "animate-compass-spin")}
      >
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="45" stroke="#C9A84C" strokeWidth="4" />
        <circle cx="50" cy="50" r="40" stroke="#C9A84C" strokeWidth="1" strokeDasharray="4 4" />

        {/* Degree Markers */}
        <line x1="50" y1="5" x2="50" y2="10" stroke="#C9A84C" strokeWidth="3" />
        <line x1="50" y1="90" x2="50" y2="95" stroke="#C9A84C" strokeWidth="3" />
        <line x1="5" y1="50" x2="10" y2="50" stroke="#C9A84C" strokeWidth="3" />
        <line x1="90" y1="50" x2="95" y2="50" stroke="#C9A84C" strokeWidth="3" />

        {/* Cardinal Points */}
        <text
          x="50"
          y="22"
          fill="#C41E3A"
          fontSize="12"
          fontWeight="900"
          textAnchor="middle"
          transform="rotate(0, 50, 50)"
        >
          N
        </text>
        <text x="50" y="86" fill="#C9A84C" fontSize="10" fontWeight="700" textAnchor="middle">
          S
        </text>
        <text x="84" y="54" fill="#C9A84C" fontSize="10" fontWeight="700" textAnchor="middle">
          E
        </text>
        <text x="16" y="54" fill="#C9A84C" fontSize="10" fontWeight="700" textAnchor="middle">
          W
        </text>

        {/* Compass Needle - North (Crimson) */}
        <path d="M50,50 L45,50 L50,15 Z" fill="#C41E3A" />
        <path d="M50,50 L55,50 L50,15 Z" fill="#E8334F" />

        {/* Compass Needle - South (Gold) */}
        <path d="M50,50 L45,50 L50,85 Z" fill="#C9A84C" />
        <path d="M50,50 L55,50 L50,85 Z" fill="#E0C36A" />

        {/* Center Pivot */}
        <circle cx="50" cy="50" r="5" fill="#FFF8E7" stroke="#C9A84C" strokeWidth="2" />
      </svg>
    </div>
  );
}
