"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, description, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 bg-ocean-mid/60 border border-ocean-surface/60 overflow-hidden group shadow-lg",
        className,
      )}
    >
      {/* Decorative Gold Compass Rose Watermark Fragment */}
      <div className="absolute -bottom-6 -right-6 w-20 h-20 text-wano-gold/5 pointer-events-none group-hover:text-wano-gold/10 group-hover:scale-110 transition-all duration-500">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M50,5 L50,95 M5,50 L95,50 M18,18 L82,82 M18,82 L82,18"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between">
        {/* Title & Info */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-wano-cream/40 uppercase tracking-widest font-heading font-semibold">
            {title}
          </span>
          <span className="text-3xl font-bold font-heading text-wano-cream tracking-wide">
            {value}
          </span>
        </div>

        {/* Themed Icon circle */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-ocean-surface/40 border border-wano-gold/15 text-wano-gold group-hover:border-wano-gold/40 group-hover:text-wano-gold-light group-hover:shadow-[0_0_10px_rgba(201,168,76,0.15)] transition-all duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {description && (
        <p className="text-[11px] text-wano-cream/50 mt-3 flex items-center gap-1">{description}</p>
      )}
    </div>
  );
}
