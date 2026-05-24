"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "~/lib/utils";

interface TechGridBackgroundProps {
  className?: string;
}

export function TechGridBackground({ className }: TechGridBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (!mounted) return [];

    // Stark hologram particles
    return Array.from({ length: 25 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 8;
      const duration = 12 + Math.random() * 12; // slow drift upwards
      const size = 3 + Math.random() * 5; // 3px to 8px
      const opacity = 0.3 + Math.random() * 0.5;

      // Stark tech particle styles (squares, glowing crosses, or dots)
      const shapes = ["rounded-full", "rounded-sm", "rotate-45 rounded-none"];
      const shapeClass = shapes[Math.floor(Math.random() * shapes.length)];

      return {
        id: i,
        style: {
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          width: `${size}px`,
          height: `${size}px`,
          opacity,
        },
        className: shapeClass,
      };
    });
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none z-0 bg-[#070b13]",
        className,
      )}
    >
      {/* Blueprint Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00f0ff 1px, transparent 1px),
            linear-gradient(to bottom, #00f0ff 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Cyber Grid Sub-divisions */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00f0ff 1px, transparent 1px),
            linear-gradient(to bottom, #00f0ff 1px, transparent 1px)
          `,
          backgroundSize: "8px 8px",
        }}
      />

      {/* Futuristic Circular HUD Ring in background */}
      <div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] border border-[#00f0ff]/5 rounded-full pointer-events-none animate-spin"
        style={{ animationDuration: "120s" }}
      >
        <div className="absolute inset-4 border border-dashed border-[#00f0ff]/3 rounded-full" />
        <div
          className="absolute inset-16 border-2 border-dotted border-[#00f0ff]/4 rounded-full animate-reverse-spin"
          style={{ animationDuration: "80s" }}
        />
      </div>

      {/* Ambient glowing vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.06)_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden z-10">
        {particles.map((p) => (
          <span
            key={p.id}
            style={p.style}
            className={cn(
              "absolute bottom-[-20px] bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-drift-up",
              p.className,
            )}
          />
        ))}
      </div>
    </div>
  );
}
