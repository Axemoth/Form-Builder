"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "~/lib/utils";

interface BatmanBackgroundProps {
  className?: string;
}

export function BatmanBackground({ className }: BatmanBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const batParticles = useMemo(() => {
    if (!mounted) return [];

    // Bats drifting slowly upwards
    return Array.from({ length: 15 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 6;
      const duration = 15 + Math.random() * 15; // slow ominous float
      const scale = 0.4 + Math.random() * 0.8;
      const opacity = 0.15 + Math.random() * 0.35;

      return {
        id: i,
        style: {
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          transform: `scale(${scale})`,
          opacity,
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
        "pointer-events-none absolute inset-0 overflow-hidden select-none z-0 bg-[#0B0C10]",
        className,
      )}
    >
      {/* Gothic Tactical Grid Map Overlays */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #F5B921 1px, transparent 1px),
            linear-gradient(to bottom, #F5B921 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #F5B921 1px, transparent 1px),
            linear-gradient(to bottom, #F5B921 1px, transparent 1px)
          `,
          backgroundSize: "15px 15px",
        }}
      />

      {/* Massive Bat-Signal searchlight sweep beam */}
      <div className="absolute -bottom-20 left-1/4 w-[500px] h-[500px] pointer-events-none opacity-[0.07] animate-pulse">
        <div
          className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(245,185,33,0.3)_0%,rgba(245,185,33,0)_70%)] animate-spin-slow"
          style={{ animationDuration: "60s" }}
        />
      </div>

      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] pointer-events-none opacity-[0.05]">
        <div
          className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(245,185,33,0.25)_0%,rgba(0,0,0,0)_60%)] animate-pulse"
          style={{ animationDuration: "12s" }}
        />
      </div>

      {/* Gotham Circular Compass / Radar Ring */}
      <div
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] border border-zinc-800/20 rounded-full pointer-events-none animate-spin"
        style={{ animationDuration: "150s" }}
      >
        <div className="absolute inset-8 border border-dashed border-zinc-800/10 rounded-full" />
        <div
          className="absolute inset-32 border-2 border-dotted border-[#F5B921]/5 rounded-full animate-reverse-spin"
          style={{ animationDuration: "100s" }}
        />
      </div>

      {/* Gothic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(11,12,16,0.95)_100%)] pointer-events-none" />

      {/* Flying bats rising up */}
      <div className="absolute inset-0 overflow-hidden z-10">
        {batParticles.map((b) => (
          <svg
            key={b.id}
            viewBox="0 0 100 60"
            style={b.style}
            className="absolute bottom-[-50px] w-12 h-8 fill-[#F5B921]/40 animate-drift-up"
          >
            <path d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z" />
          </svg>
        ))}
      </div>
    </div>
  );
}
