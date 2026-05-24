"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "~/lib/utils";

interface CherryBlossomsProps {
  intensity?: "light" | "normal" | "heavy";
  className?: string;
}

export function CherryBlossoms({ intensity = "normal", className }: CherryBlossomsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = useMemo(() => {
    switch (intensity) {
      case "light":
        return 10;
      case "heavy":
        return 35;
      case "normal":
      default:
        return 20;
    }
  }, [intensity]);

  const petals = useMemo(() => {
    if (!mounted) return [];

    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100; // random horizontal position
      const delay = Math.random() * 12; // random start delay
      const duration = 8 + Math.random() * 12; // random fall duration (8s to 20s)
      const size = 8 + Math.random() * 10; // size in pixels (8px to 18px)
      const opacity = 0.4 + Math.random() * 0.5; // opacity (0.4 to 0.9)
      const isAlternativeColor = Math.random() > 0.6; // some petals are whiter/lighter

      return {
        id: i,
        style: {
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          width: `${size}px`,
          height: `${size * 0.7}px`,
          opacity,
        },
        className: isAlternativeColor
          ? "bg-[#FFE4E9] border border-[#FFCCD5]/50"
          : "bg-[#FFB7C5] border border-[#FFA6B9]/50",
      };
    });
  }, [count, mounted]);

  // Conqueror's Haki white sparks — small glowing particles that float upward like embers
  const hakiSparks = useMemo(() => {
    if (!mounted) return [];

    return Array.from({ length: 12 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 10;
      const duration = 3 + Math.random() * 4; // 3s to 7s float
      const size = 2 + Math.random() * 4; // 2px to 6px

      return {
        id: i,
        style: {
          left: `${left}%`,
          bottom: `${Math.random() * 30}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          width: `${size}px`,
          height: `${size}px`,
        },
      };
    });
  }, [mounted]);

  // Conqueror's Haki lightning — brief crackling flashes that appear at random positions
  const hakiLightning = useMemo(() => {
    if (!mounted) return [];

    return Array.from({ length: 3 }).map((_, i) => {
      const left = 10 + Math.random() * 80; // keep within 10%-90% horizontal
      const top = Math.random() * 50; // upper half of the viewport
      const delay = 4 + Math.random() * 12; // staggered 4s-16s start
      const duration = 3 + Math.random() * 5; // full cycle 3s-8s (only visible briefly)
      const rotate = -20 + Math.random() * 40; // slight random tilt

      return {
        id: i,
        style: {
          left: `${left}%`,
          top: `${top}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          transform: `rotate(${rotate}deg)`,
        },
      };
    });
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none z-10",
        className,
      )}
    >

      {/* Conqueror's Haki Lightning Bolts — brief crackling flashes */}
      {hakiLightning.map((bolt) => (
        <svg
          key={`lightning-${bolt.id}`}
          viewBox="0 0 40 120"
          style={bolt.style}
          className="absolute w-8 h-24 fill-none stroke-white stroke-[1.5] filter drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] drop-shadow-[0_0_25px_rgba(201,168,76,0.6)]"
          aria-hidden="true"
        >
          <path
            d="M 20,0 L 14,28 L 22,32 L 12,60 L 18,62 L 8,95 L 28,55 L 20,52 L 28,28 L 20,24 Z"
            className="fill-white/80"
            style={{ animation: `haki-lightning-flash ${bolt.style.animationDuration} ease-in-out ${bolt.style.animationDelay} infinite` }}
          />
        </svg>
      ))}

      {/* White Haki Sparks — small glowing particles floating upward */}
      {hakiSparks.map((spark) => (
        <span
          key={`spark-${spark.id}`}
          style={spark.style}
          className="absolute rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9),0_0_12px_rgba(201,168,76,0.4)] animate-haki-spark"
        />
      ))}

      {/* Falling Sakura Cherry Blossoms */}
      {petals.map((petal) => (
        <span
          key={petal.id}
          style={petal.style}
          className={cn(
            "absolute -top-5 rounded-tl-[50%] rounded-br-[50%] rounded-tr-[20%] rounded-bl-[20%] animate-sakura-fall shadow-[0_2px_5px_rgba(255,183,197,0.2)]",
            petal.className,
          )}
        />
      ))}
    </div>
  );
}

