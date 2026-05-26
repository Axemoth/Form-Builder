"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { StrawHat } from "~/components/ui/straw-hat";
import { BatLogo } from "~/components/ui/bat-logo";
import { CherryBlossoms } from "~/components/ui/cherry-blossoms";
import { TechGridBackground } from "~/components/ui/tech-grid-background";
import { BatmanBackground } from "~/components/ui/batman-background";
import { Check, Star, Anchor, Shield, ShieldAlert, Sparkles } from "lucide-react";

interface ThemeItem {
  id: "wano" | "stark" | "batman";
  name: string;
  badge?: string;
  tagline: string;
  description: string;
  colorClass: string;
  borderClass: string;
  badgeClass: string;
}

export function ThemesSection() {
  const [activeTheme, setActiveTheme] = useState<"wano" | "stark" | "batman">("wano");

  const themesList: ThemeItem[] = [
    {
      id: "wano",
      name: "Wano Country",
      badge: "System Default",
      tagline: "Classic Elegant Theme",
      description:
        "Featuring falling cherry blossom petals, deep indigo waves, warm parchment textures, and elegant gold accents for a refined visual experience.",
      colorClass: "from-wano-crimson to-wano-gold",
      borderClass: "border-wano-gold/40",
      badgeClass: "bg-wano-gold/15 text-wano-gold border-wano-gold/30",
    },
    {
      id: "stark",
      name: "Stark Tech / JARVIS",
      badge: "Futuristic HUD",
      tagline: "Avengers Telemetry",
      description:
        "Initialize secure hologram datalinks with glowing cyan grids, diagnostic circular HUD systems, monospace typewriter telemetry, and active ARC Reactor metrics.",
      colorClass: "from-[#00f0ff] to-blue-500",
      borderClass: "border-[#00f0ff]/40",
      badgeClass: "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30",
    },
    {
      id: "batman",
      name: "Gotham Knight (Batman)",
      badge: "Premium Gothic",
      tagline: "Vigilante Dark Intel",
      description:
        "Conduct high-security surveillance with deep charcoal-concrete layers, drifting geometric bat vectors, yellow-gold pulse details, and custom Bat-Symbol rating nodes.",
      colorClass: "from-[#F5B921] to-[#8B6508]",
      borderClass: "border-[#F5B921]/40",
      badgeClass: "bg-[#F5B921]/15 text-[#F5B921] border-[#F5B921]/30",
    },
  ];

  // Helper values for the mock rating widget in the card
  const [ratingVal, setRatingVal] = useState<number>(4);

  return (
    <section id="themes" className="relative py-24 px-6 md:px-12 bg-ocean-deep overflow-hidden">
      {/* Background vignette & layout stars */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(28,49,82,0.45)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wano-gold/10 border border-wano-gold/20 text-wano-gold text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Dynamic Styling Engine
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-wano-cream mb-4">
            Dynamic database <span className="text-gradient-gold">Form Themes</span>
          </h2>
          <p className="text-wano-cream/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Break free from dull layouts. Equip your published forms with fully-responsive,
            highly-immersive visual skins tailored to your brand.
          </p>
          <div className="w-24 h-1 bg-wano-gold/30 mx-auto mt-4 rounded-full" />
        </div>

        {/* Dynamic Theme Showcase Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left panel: Theme selection toggles */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {themesList.map((t) => {
              const isActive = activeTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTheme(t.id)}
                  type="button"
                  className={cn(
                    "w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group outline-none",
                    isActive
                      ? "bg-ocean-mid/90 shadow-[0_10px_30px_rgba(0,0,0,0.4)] scale-[1.02]"
                      : "bg-ocean-mid/30 border-ocean-surface/40 hover:bg-ocean-mid/50 hover:border-ocean-surface/80",
                  )}
                  style={{
                    borderColor: isActive ? "transparent" : "",
                  }}
                >
                  {/* Glowing color edge accent on active state */}
                  {isActive && (
                    <div
                      className={cn(
                        "absolute inset-0 p-[2px] rounded-2xl bg-gradient-to-r pointer-events-none z-0",
                        t.colorClass,
                      )}
                    >
                      <div className="w-full h-full bg-ocean-mid rounded-[14px]" />
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-lg text-wano-cream group-hover:text-wano-gold transition-colors duration-200">
                        {t.name}
                      </span>
                      {t.badge && (
                        <span
                          className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                            t.badgeClass,
                          )}
                        >
                          {t.badge}
                        </span>
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wider bg-gradient-to-r bg-clip-text text-transparent font-sans",
                        t.colorClass,
                      )}
                    >
                      {t.tagline}
                    </span>

                    <p className="text-xs text-wano-cream/60 leading-relaxed font-light mt-1">
                      {t.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right panel: Live Interactive Mockup Sandbox card */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Interactive display casing */}
            <div className="w-full max-w-lg rounded-3xl p-1 bg-gradient-to-b from-ocean-surface/60 to-ocean-deep/95 shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-ocean-surface/50 relative overflow-hidden group min-h-[580px]">
              {/* Theme specific background wrappers */}
              {activeTheme === "wano" && (
                <div className="absolute inset-0 bg-ocean-deep/95 pointer-events-none transition-opacity duration-500 z-0">
                  <CherryBlossoms intensity="normal" className="absolute inset-0 opacity-80" />
                  {/* Subtle waves grid */}
                  <div className="absolute bottom-0 left-0 right-0 h-40 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_bottom,rgba(36,83,128,0.25)_0%,transparent_70%)]" />
                </div>
              )}

              {activeTheme === "stark" && (
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-0 overflow-hidden">
                  <TechGridBackground className="absolute inset-0" />
                </div>
              )}

              {activeTheme === "batman" && (
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-0 overflow-hidden">
                  <BatmanBackground className="absolute inset-0" />
                </div>
              )}

              {/* Dynamic Theme Interactive Mock Card */}
              <div className="relative z-10 p-6 md:p-8 flex flex-col gap-6 min-h-[570px] select-none">
                {/* Visual Theme Card container */}
                <div
                  className={cn(
                    "rounded-2xl p-5 md:p-6 flex flex-col gap-5 border-2 transition-all duration-300 w-full relative z-10 shadow-2xl flex-1 justify-between",
                    activeTheme === "wano" &&
                      "bg-ocean-mid/85 text-wano-cream border-ocean-surface/80 font-sans animate-drums-beat shadow-[0_15px_40px_rgba(0,0,0,0.4)] shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-shadow duration-500",
                    activeTheme === "stark" &&
                      "bg-[#0B1528]/85 border-[#00f0ff]/20 text-cyan-100 font-mono shadow-[0_0_20px_rgba(0,240,255,0.1)]",
                    activeTheme === "batman" &&
                      "bg-zinc-950/85 border-zinc-800 text-zinc-100 font-sans shadow-[0_0_20px_rgba(245,185,33,0.1)]",
                  )}
                >
                  {/* Themed corner HUD highlights */}
                  {activeTheme === "wano" && (
                    <>
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-wano-gold/50 rounded-tl-xl pointer-events-none" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-wano-gold/50 rounded-tr-xl pointer-events-none" />
                      <StrawHat className="absolute -top-6 -left-6 w-14 h-9 rotate-[-12deg] z-20 pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.85)]" />
                    </>
                  )}
                  {activeTheme === "stark" && (
                    <>
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00f0ff] pointer-events-none animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#00f0ff] pointer-events-none animate-pulse" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#00f0ff] pointer-events-none animate-pulse" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00f0ff] pointer-events-none animate-pulse" />
                    </>
                  )}
                  {activeTheme === "batman" && (
                    <>
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#F5B921] pointer-events-none animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#F5B921] pointer-events-none animate-pulse" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#F5B921] pointer-events-none animate-pulse" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#F5B921] pointer-events-none animate-pulse" />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none drop-shadow-[0_2px_6px_rgba(245,185,33,0.3)]">
                        <BatLogo className="w-10 h-6 fill-[#F5B921]" />
                      </div>
                    </>
                  )}

                  {/* Header */}
                  <div
                    className={cn(
                      "border-b pb-4 text-center mt-2 relative",
                      activeTheme === "wano"
                        ? "border-wano-gold/20"
                        : activeTheme === "stark"
                          ? "border-[#00f0ff]/20"
                          : "border-zinc-800",
                    )}
                  >
                    {activeTheme === "wano" && (
                      <div className="text-[9px] font-semibold text-wano-gold uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1">
                        <Anchor className="w-3 h-3 animate-spin-slow" />
                        Survey Response Form
                      </div>
                    )}
                    {activeTheme === "stark" && (
                      <div className="text-[9px] text-[#00f0ff] tracking-widest uppercase mb-1 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
                        JARVIS COMLINK ACTIVE
                      </div>
                    )}
                    {activeTheme === "batman" && (
                      <div className="text-[9px] text-[#F5B921] tracking-wider uppercase mb-1 font-semibold">
                        WAYNE INTEL PROTOCOL v3.0
                      </div>
                    )}

                    <h3
                      className={cn(
                        "text-xl font-bold tracking-wide",
                        activeTheme === "wano" && "font-heading text-wano-cream",
                        activeTheme === "stark" && "font-mono text-cyan-100 uppercase",
                        activeTheme === "batman" &&
                          "font-sans text-zinc-50 uppercase tracking-widest font-black",
                      )}
                    >
                      {activeTheme === "wano" && "Team Feedback Survey"}
                      {activeTheme === "stark" && "Tony Stark Network Access"}
                      {activeTheme === "batman" && "Gotham Vigilante Checkpoint"}
                    </h3>
                  </div>

                  {/* Mock Interactive Inputs */}
                  <div className="space-y-4 flex-1 my-2">
                    {/* Input Field */}
                    <div className="space-y-1.5 text-left">
                      <label
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider block",
                          activeTheme === "wano" && "text-wano-gold",
                          activeTheme === "stark" && "text-[#00f0ff]/80",
                          activeTheme === "batman" && "text-[#F5B921]",
                        )}
                      >
                        {activeTheme === "wano" && "Your Full Name *"}
                        {activeTheme === "stark" && "Operator Security ID *"}
                        {activeTheme === "batman" && "Authorized Codename *"}
                      </label>
                      <div
                        className={cn(
                          "rounded-lg text-xs px-3.5 py-2.5 h-9 flex items-center border shadow-inner",
                          activeTheme === "wano" &&
                            "bg-ocean-mid/80 border-ocean-surface text-wano-cream placeholder:text-wano-cream/20",
                          activeTheme === "stark" &&
                            "bg-[#0B1528]/60 border-[#00f0ff]/20 text-cyan-200 placeholder:text-cyan-200/20",
                          activeTheme === "batman" &&
                            "bg-zinc-900/60 border-zinc-850 text-zinc-300 placeholder:text-zinc-550",
                        )}
                      >
                        {activeTheme === "wano" && "John Doe"}
                        {activeTheme === "stark" && "JARVIS-RECRUIT-902"}
                        {activeTheme === "batman" && "DARK KNIGHT 82"}
                      </div>
                    </div>

                    {/* Ratings Field */}
                    <div className="space-y-1.5 text-left">
                      <label
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider block",
                          activeTheme === "wano" && "text-wano-gold",
                          activeTheme === "stark" && "text-[#00f0ff]/80",
                          activeTheme === "batman" && "text-[#F5B921]",
                        )}
                      >
                        {activeTheme === "wano" && "Overall Satisfaction"}
                        {activeTheme === "stark" && "Core Reactor Efficiency"}
                        {activeTheme === "batman" && "Threat Assessment Metric"}
                      </label>

                      {/* Ratings stars interactive display */}
                      <div className="flex items-center gap-2 py-1">
                        {Array.from({ length: 5 }).map((_, rIdx) => {
                          const isLit = rIdx < ratingVal;
                          return (
                            <button
                              key={rIdx}
                              onClick={() => setRatingVal(rIdx + 1)}
                              type="button"
                              className="focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-120 active:scale-90"
                            >
                              {activeTheme === "wano" && (
                                <span
                                  className={cn(
                                    "text-lg transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] inline-block",
                                    isLit
                                      ? "opacity-100 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] scale-110"
                                      : "opacity-20 hover:scale-115"
                                  )}
                                >
                                  ☠️
                                </span>
                              )}
                              {activeTheme === "stark" && (
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-full border flex items-center justify-center text-[8px] transition-all",
                                    isLit
                                      ? "border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                                      : "border-[#00f0ff]/20 text-[#00f0ff]/20",
                                  )}
                                >
                                  ⚙️
                                </div>
                              )}
                              {activeTheme === "batman" && (
                                <BatLogo
                                  className={cn(
                                    "w-6 h-4 transition-all duration-200",
                                    isLit
                                      ? "fill-[#F5B921] drop-shadow-[0_0_4px_rgba(245,185,33,0.5)] opacity-100"
                                      : "fill-zinc-800 opacity-40",
                                  )}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Single Checkbox Choice */}
                    <div className="flex items-center gap-3 pt-2">
                      <div
                        className={cn(
                          "w-4 h-4 rounded flex items-center justify-center shrink-0 border",
                          activeTheme === "wano"
                            ? "border-wano-gold bg-wano-gold/20 text-wano-cream shadow-[0_0_10px_rgba(255,255,255,0.15)] scale-110 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                            : "transition-all",
                          activeTheme === "stark" &&
                            "border-[#00f0ff] bg-[#00f0ff]/10 text-cyan-200 shadow-[0_0_6px_rgba(0,240,255,0.15)]",
                          activeTheme === "batman" &&
                            "border-[#F5B921] bg-zinc-900 text-[#F5B921] shadow-[0_0_6px_rgba(245,185,33,0.15)]",
                        )}
                      >
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span
                        className={cn(
                          "text-[10px]",
                          activeTheme === "wano" && "text-wano-cream/80",
                          activeTheme === "stark" && "text-cyan-200/80 font-mono",
                          activeTheme === "batman" && "text-zinc-400 font-sans",
                        )}
                      >
                        {activeTheme === "wano" && "I agree to the terms and conditions"}
                        {activeTheme === "stark" && "AUTHORIZE DATA BACKUP DISPATCH LOG"}
                        {activeTheme === "batman" && "ENCRYPT AND TRANSMIT INTELLIGENCE COPIES"}
                      </span>
                    </div>
                  </div>

                  {/* Submission HUD Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className={cn(
                        "w-full py-2.5 px-4 text-xs font-bold rounded-xl transition-all duration-300 border-2 select-none shadow-md flex items-center justify-center gap-2",
                        activeTheme === "wano" &&
                          "bg-wano-gold border-wano-gold hover:bg-wano-gold/90 hover:scale-[1.02] text-ocean-deep font-heading transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
                        activeTheme === "stark" &&
                          "bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/20 font-mono tracking-widest",
                        activeTheme === "batman" &&
                          "bg-zinc-900 border-[#F5B921] text-[#F5B921] hover:bg-zinc-900/80 font-sans tracking-widest uppercase font-bold",
                      )}
                    >
                      {activeTheme === "wano" && "Submit Response"}
                      {activeTheme === "stark" && "INITIATE TRANSMISSION"}
                      {activeTheme === "batman" && "TRANSMIT TO BATCAVE"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
