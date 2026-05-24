"use client";

import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 md:p-8 flex flex-col bg-ocean-mid/80 border border-ocean-surface/60 card-hover-lift group overflow-hidden",
        className,
      )}
    >
      {/* Decorative Swirl Backlight */}
      <div className="absolute -top-10 -right-10 w-24 h-24 fruit-swirl-subtle rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

      {/* Floating Fruit Icon Container */}
      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-ocean-surface/50 border border-wano-gold/20 text-wano-gold shadow-lg group-hover:border-wano-gold group-hover:text-wano-gold-light group-hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all duration-300 relative">
        {/* Subtle internal swirl background */}
        <div className="absolute inset-[2px] rounded-full fruit-swirl opacity-5 group-hover:opacity-15 transition-opacity duration-300" />
        <div className="z-10">{icon}</div>
      </div>

      {/* Content */}
      <h3 className="font-heading text-lg md:text-xl text-wano-cream mt-6 tracking-wide group-hover:text-wano-gold-light transition-colors duration-300 ink-brush-text w-fit">
        {title}
      </h3>
      <p className="text-wano-cream/60 text-sm mt-3 leading-relaxed">{description}</p>

      {/* Decorative corner swirl watermark */}
      <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full border border-wano-sakura/5 opacity-5 group-hover:opacity-10 transition-opacity duration-300" />
    </div>
  );
}
