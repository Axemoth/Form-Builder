"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "~/components/layout/page-header";
import { Button } from "~/components/ui/button";
import { StrawHat } from "~/components/ui/straw-hat";
import { BatLogo } from "~/components/ui/bat-logo";
import { Sparkles, Palette, Shield, Compass, Check, ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";

interface GalleryTheme {
  id: "wano" | "stark" | "batman";
  name: string;
  badge: string;
  tagline: string;
  description: string;
  bullets: string[];
  colorClass: string;
  borderClass: string;
  textClass: string;
  bgClass: string;
  accentClass: string;
  icon: string;
}

export default function ThemeGalleryPage() {
  const router = useRouter();

  const galleryThemes: GalleryTheme[] = [
    {
      id: "wano",
      name: "Wano Country (One Piece)",
      badge: "⚓ System Default",
      tagline: "The Grand Line Voyage",
      description:
        "Embrace the visual spirit of Wano Country with calligraphic borders, parchment backings, and a divine Gear 5 Nika white-hot conqueror Haki touch.",
      bullets: [
        "🌸 Client-side canvas-drawn falling cherry blossom petals",
        "👒 Tilted golden-straw pirate hat ornaments absolute-positioned over headings",
        "☠️ Custom pirate Jolly Roger skulls for form rating parameters",
        "📦 Animated golden treasure chest submission success triggers",
        "☁️ Puffy white Gear 5 Nika divine cartoon clouds & Drums of Liberation heartbeat throb",
      ],
      colorClass: "from-wano-crimson via-wano-gold to-wano-sakura",
      borderClass:
        "border-wano-gold/30 hover:border-wano-gold/70 shadow-[0_0_20px_rgba(201,168,76,0.05)]",
      textClass: "text-wano-cream",
      bgClass: "bg-ocean-mid/45",
      accentClass: "text-wano-gold",
      icon: "🌸",
    },
    {
      id: "stark",
      name: "Stark Tech / JARVIS",
      badge: "⚡ Futuristic HUD",
      tagline: "Avengers Telemetry",
      description:
        "Initialize secure, high-tech diagnostic data links styled in monospaced grids, glowing active frames, and futuristic dials.",
      bullets: [
        "🛸 Interactive laser blueprint grid-lines & circular HUD radars",
        "🪐 Floating cybernetic neon cyan square and glowing cross particles",
        "⚙️ ARC Reactor segment circles for futuristic form rating items",
        "🛡️ Animated holographic ARC Reactor core activation success modules",
      ],
      colorClass: "from-[#00f0ff] via-cyan-400 to-blue-500",
      borderClass:
        "border-[#00f0ff]/20 hover:border-[#00f0ff]/60 shadow-[0_0_20px_rgba(0,240,255,0.05)]",
      textClass: "text-cyan-100 font-mono",
      bgClass: "bg-[#0B1528]/50",
      accentClass: "text-[#00f0ff]",
      icon: "🛡️",
    },
    {
      id: "batman",
      name: "Gotham Knight (Batman)",
      badge: "🦇 Premium Gothic",
      tagline: "Vigilante Dark Intel",
      description:
        "Conduct high-security surveillance with matte gunmetal concrete textures, sharp tactical yellow highlights, and classic silhouettes.",
      bullets: [
        "🌃 Ominous radial sweeping spotlights projecting the iconic Bat-Signal",
        "🦇 Floating geometric bat silhouettes drifting upwards on active pages",
        "⚔️ Sharp golden blinking HUD corner frame overlays and boundaries",
        "📡 Wayne Enterprises Com-Link database secured success alerts",
      ],
      colorClass: "from-[#F5B921] via-amber-400 to-[#8B6508]",
      borderClass:
        "border-zinc-800 hover:border-[#F5B921]/50 shadow-[0_0_20px_rgba(245,185,33,0.05)]",
      textClass: "text-zinc-100",
      bgClass: "bg-zinc-950/80",
      accentClass: "text-[#F5B921]",
      icon: "🦇",
    },
  ];

  const handleSelectTheme = (themeId: string) => {
    // Navigate directly to the dashboard, triggering the form creation modal with the pre-selected theme!
    router.push(`/dashboard?create=true&theme=${themeId}`);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Theme Gallery"
        description="Select a premium pre-styled aesthetic canvas to instantly chart a new form with high-fidelity visual decorations."
      />

      {/* Main themes catalog grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {galleryThemes.map((theme) => (
          <div
            key={theme.id}
            className={cn(
              "rounded-3xl border-2 p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group hover:scale-[1.01] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] min-h-[560px]",
              theme.borderClass,
              theme.bgClass,
              theme.id === "wano" && "animate-drums-beat shadow-[0_0_25px_rgba(255,255,255,0.08)] hover:shadow-[0_0_35px_rgba(255,255,255,0.2)]",
            )}
          >
            {/* Background absolute visuals */}
            {theme.id === "wano" && (
              <>
                <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-wano-gold/5 rounded-full filter blur-2xl pointer-events-none" />
                <StrawHat className="absolute -top-3 -right-3 w-16 h-10 rotate-[15deg] opacity-70 group-hover:opacity-100 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.85)] transition-all duration-300 drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]" />
              </>
            )}
            {theme.id === "stark" && (
              <>
                <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-[#00f0ff]/5 rounded-full filter blur-2xl pointer-events-none animate-pulse" />
                <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full border-2 border-dashed border-[#00f0ff]/10 pointer-events-none group-hover:border-[#00f0ff]/25 transition-colors animate-spin-slow" />
              </>
            )}
            {theme.id === "batman" && (
              <>
                <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-[#F5B921]/5 rounded-full filter blur-2xl pointer-events-none" />
                <div className="absolute -top-4 -right-4 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                  <BatLogo className="w-14 h-8 fill-[#F5B921]" />
                </div>
              </>
            )}

            {/* Content Body */}
            <div className="space-y-6 relative z-10 text-left">
              {/* Badge & Title */}
              <div className="space-y-2">
                <span
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-ocean-surface/60",
                    theme.id === "wano" && "text-wano-gold border-wano-gold/20",
                    theme.id === "stark" && "text-[#00f0ff] border-[#00f0ff]/20",
                    theme.id === "batman" && "text-[#F5B921] border-[#F5B921]/20",
                  )}
                >
                  {theme.badge}
                </span>

                <h3
                  className={cn(
                    "text-xl font-bold tracking-wide mt-2 pt-1",
                    theme.id === "wano" && "font-heading text-wano-cream",
                    theme.id === "stark" && "font-mono text-cyan-50 uppercase",
                    theme.id === "batman" && "font-sans text-zinc-50 uppercase font-black",
                  )}
                >
                  {theme.name}
                </h3>

                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider block font-sans",
                    theme.accentClass,
                  )}
                >
                  {theme.tagline}
                </span>
              </div>

              {/* Description */}
              <p
                className={cn(
                  "text-xs leading-relaxed font-light",
                  theme.id === "stark" ? "text-cyan-200/60 font-mono" : "text-wano-cream/60",
                )}
              >
                {theme.description}
              </p>

              {/* Features List */}
              <div className="space-y-3 pt-2">
                <h4
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    theme.id === "wano" && "text-wano-gold font-heading",
                    theme.id === "stark" && "text-cyan-400 font-mono",
                    theme.id === "batman" && "text-[#F5B921] font-sans",
                  )}
                >
                  ⚜️ Theme Components
                </h4>

                <ul className="space-y-2.5">
                  {theme.bullets.map((bullet, idx) => (
                    <li
                      key={idx}
                      className={cn(
                        "text-[11px] leading-relaxed flex items-start gap-2 font-light",
                        theme.id === "stark" ? "text-cyan-200/80 font-mono" : "text-wano-cream/80",
                      )}
                    >
                      <span className="shrink-0 text-xs mt-0.5">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Selection Trigger Button */}
            <div className="pt-8 relative z-10 w-full">
              <Button
                onClick={() => handleSelectTheme(theme.id)}
                className={cn(
                  "w-full py-3 h-12 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:scale-[1.01] transition-all duration-300 border-2 select-none font-heading shadow-lg text-xs tracking-wider uppercase",
                  theme.id === "wano" &&
                    "bg-wano-gold border-wano-gold hover:bg-wano-gold/90 hover:scale-[1.02] text-ocean-deep transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] shadow-[0_5px_15px_rgba(201,168,76,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
                  theme.id === "stark" &&
                    "bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/20 font-mono",
                  theme.id === "batman" &&
                    "bg-zinc-900 border-[#F5B921] text-[#F5B921] hover:bg-[#F5B921] hover:text-zinc-950 font-sans font-black",
                )}
              >
                Chart Form with{" "}
                {theme.id === "wano" ? "Wano" : theme.id === "stark" ? "Stark" : "Gotham"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
