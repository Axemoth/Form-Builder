"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { FormRenderer } from "~/components/form-renderer/form-renderer";
import { PasswordGate } from "~/components/form-renderer/password-gate";
import { CompassLoader } from "~/components/ui/compass-loader";
import { CherryBlossoms } from "~/components/ui/cherry-blossoms";
import { WaveBackground } from "~/components/ui/wave-background";
import { TechGridBackground } from "~/components/ui/tech-grid-background";
import { BatmanBackground } from "~/components/ui/batman-background";
import { StrawHat } from "~/components/ui/straw-hat";
import { Anchor, Compass, Ghost, ShieldAlert, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [password, setPassword] = useState("");

  // Fetch form details by slug
  const {
    data: form,
    isLoading,
    error,
    refetch,
  } = trpc.form.getFormBySlug.useQuery(
    {
      slug,
      password: password || undefined,
      isPreview: false,
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ocean-deep text-wano-cream gap-5 p-4">
        <CompassLoader size="lg" />
        <h3 className="font-heading text-lg font-bold text-wano-gold tracking-wide animate-pulse">
          Charting Sea Routes...
        </h3>
        <p className="text-xs text-wano-cream/40 font-mono uppercase tracking-widest">
          Sailing towards secret coordinates
        </p>
      </div>
    );
  }

  // 1. Handled 404 / Error states
  if (error || !form) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0C10] text-zinc-100 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,185,33,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-md bg-zinc-950/80 border-2 border-dashed border-zinc-800 rounded-3xl p-8 text-center backdrop-blur-md shadow-2xl relative z-10">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#F5B921] mx-auto mb-6 animate-pulse">
            <Ghost className="w-8 h-8" />
          </div>
          <h3 className="font-sans text-xl font-black uppercase tracking-wider text-zinc-100 mb-3">
            Signal Lost in Gotham
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            We could not trace this form channel. The coordinates might have expired, or the
            tactical signal was intercepted and taken offline.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#F5B921] hover:bg-[#F5B921]/90 hover:shadow-[0_0_15px_rgba(245,185,33,0.4)] text-[#0B0C10] font-sans font-bold text-xs px-6 py-2.5 h-auto rounded-xl w-full"
          >
            Return to Batcave 🦇
          </Button>
        </div>
      </div>
    );
  }

  // 2. Handled Password Gate
  if (form.isPasswordProtected && form.passwordLocked) {
    return (
      <PasswordGate
        slug={slug}
        onUnlocked={(pwd) => {
          setPassword(pwd);
          // Refetch with password input included
          setTimeout(() => refetch(), 100);
        }}
      />
    );
  }

  // 3. Handled Expired Island
  if (form.expired) {
    const isStark = form.themeName === "stark";
    const isBatman = form.themeName === "batman";
    return (
      <div
        className={cn(
          "min-h-screen flex flex-col items-center justify-center text-wano-cream p-4 relative overflow-hidden",
          isBatman ? "bg-[#0B0C10] text-zinc-100" : isStark ? "bg-[#070b13]" : "bg-ocean-deep",
        )}
      >
        {isBatman ? (
          <BatmanBackground />
        ) : isStark ? (
          <TechGridBackground />
        ) : (
          <CherryBlossoms intensity="light" />
        )}
        {!isStark && !isBatman && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.05)_0%,transparent_70%)] pointer-events-none" />
        )}

        <div
          className={cn(
            "w-full max-w-md p-8 text-center backdrop-blur-md shadow-2xl relative z-10 border-2 rounded-3xl",
            isBatman
              ? "bg-zinc-950/85 border-zinc-800 shadow-[0_0_20px_rgba(245,185,33,0.1)] font-sans"
              : isStark
                ? "bg-[#0B1528]/85 border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.1)] font-mono"
                : "bg-ocean-mid/40 border-ocean-surface/60",
          )}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6",
              isBatman
                ? "bg-[#F5B921]/10 border border-[#F5B921]/30 text-[#F5B921]"
                : isStark
                  ? "bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]"
                  : "bg-wano-gold/10 border border-wano-gold/30 text-wano-gold",
            )}
          >
            {isBatman ? (
              <svg viewBox="0 0 100 60" className="w-8 h-8 fill-current">
                <path d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z" />
              </svg>
            ) : isStark ? (
              <Shield className="w-8 h-8 animate-pulse" />
            ) : (
              <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: "8s" }} />
            )}
          </div>
          <h3
            className={cn(
              "text-xl font-bold mb-3",
              isBatman
                ? "text-zinc-100 font-sans font-black tracking-wider uppercase"
                : isStark
                  ? "text-cyan-100"
                  : "text-wano-cream",
            )}
          >
            {isBatman
              ? "COM LINK EXPIRED"
              : isStark
                ? "TELEMETRY LINK TIMED OUT"
                : "This Island Has Sunk"}
          </h3>
          <p
            className={cn(
              "text-xs leading-relaxed mb-6",
              isBatman
                ? "text-zinc-400 font-sans"
                : isStark
                  ? "text-cyan-200/50"
                  : "text-wano-cream/50",
            )}
          >
            {isBatman
              ? "The secure coordinates communication link has dissolved. Contact Wayne Tech support for fresh authorization credentials."
              : isStark
                ? "The secure link to the server system coordinates has expired or dissolved. Contact the main deck for fresh authorization token access."
                : "The log pose connection has dissolved. This survey island has officially expired and sunk beneath the Grand Line waves."}
          </p>
          <Button
            onClick={() => router.push("/")}
            className={cn(
              "font-bold text-xs px-6 py-2.5 h-auto rounded-xl w-full",
              isBatman
                ? "bg-[#F5B921] hover:bg-[#F5B921]/90 hover:shadow-[0_0_15px_rgba(245,185,33,0.4)] text-[#0B0C10] font-sans font-bold"
                : isStark
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] text-[#070b13] border border-cyan-300/40"
                  : "btn-gold font-heading",
            )}
          >
            {isBatman ? "TERMINATE LINK 🔌" : isStark ? "TERMINATE CONNECT 📡" : "Set Sail Home 🧭"}
          </Button>
        </div>
      </div>
    );
  }

  // 4. Handled Response Limit Reached
  if (form.responseLimitReached) {
    const isStark = form.themeName === "stark";
    const isBatman = form.themeName === "batman";
    return (
      <div
        className={cn(
          "min-h-screen flex flex-col items-center justify-center text-wano-cream p-4 relative overflow-hidden",
          isBatman ? "bg-[#0B0C10] text-zinc-100" : isStark ? "bg-[#070b13]" : "bg-ocean-deep",
        )}
      >
        {isBatman ? (
          <BatmanBackground />
        ) : isStark ? (
          <TechGridBackground />
        ) : (
          <CherryBlossoms intensity="light" />
        )}
        {!isStark && !isBatman && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(78,205,196,0.05)_0%,transparent_70%)] pointer-events-none" />
        )}

        <div
          className={cn(
            "w-full max-w-md p-8 text-center backdrop-blur-md shadow-2xl relative z-10 border-2 rounded-3xl",
            isBatman
              ? "bg-zinc-950/85 border-zinc-800 shadow-[0_0_20px_rgba(245,185,33,0.1)] font-sans"
              : isStark
                ? "bg-[#0B1528]/85 border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.1)] font-mono"
                : "bg-ocean-mid/40 border-ocean-surface/60",
          )}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6",
              isBatman
                ? "bg-[#F5B921]/10 border border-[#F5B921]/30 text-[#F5B921]"
                : isStark
                  ? "bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]"
                  : "bg-fruit-glow/10 border border-fruit-glow/30 text-fruit-glow",
            )}
          >
            {isBatman ? (
              <svg viewBox="0 0 100 60" className="w-8 h-8 fill-current">
                <path d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z" />
              </svg>
            ) : isStark ? (
              <Shield className="w-8 h-8 animate-pulse" />
            ) : (
              <Anchor className="w-8 h-8 animate-bounce" />
            )}
          </div>
          <h3
            className={cn(
              "text-xl font-bold mb-3",
              isBatman
                ? "text-zinc-100 font-sans font-black tracking-wider uppercase"
                : isStark
                  ? "text-cyan-100"
                  : "text-wano-cream",
            )}
          >
            {isBatman
              ? "BAT-RELAYS FULL"
              : isStark
                ? "STORAGE CHANNELS FULL"
                : "Treasures Fully Claimed!"}
          </h3>
          <p
            className={cn(
              "text-xs leading-relaxed mb-6",
              isBatman
                ? "text-zinc-400 font-sans"
                : isStark
                  ? "text-cyan-200/50"
                  : "text-wano-cream/50",
            )}
          >
            {isBatman
              ? "All available communication relays for this secure Gotham channel have been filled. Maximum response threshold reached."
              : isStark
                ? "All available data storage cores for this secure telemetry channel have been filled. Transmission capacity exceeded."
                : "The maximum response cargo has already been logged. All available bounty and treasure have been fully collected by other pirate ships!"}
          </p>
          <Button
            onClick={() => router.push("/")}
            className={cn(
              "font-bold text-xs px-6 py-2.5 h-auto rounded-xl w-full",
              isBatman
                ? "bg-[#F5B921] hover:bg-[#F5B921]/90 hover:shadow-[0_0_15px_rgba(245,185,33,0.4)] text-[#0B0C10] font-sans font-bold"
                : isStark
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] text-[#070b13] border border-cyan-300/40"
                  : "btn-crimson font-heading font-bold",
            )}
          >
            {isBatman
              ? "DISCONNECT INTERFACE 🔌"
              : isStark
                ? "DISCONNECT INTERFACE 📡"
                : "Chart a New Route"}
          </Button>
        </div>
      </div>
    );
  }

  const themeName = form.themeName || "wano";
  const isStark = themeName === "stark";
  const isBatman = themeName === "batman";

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col justify-between relative overflow-hidden py-16 px-4",
        isBatman
          ? "bg-[#0B0C10] text-zinc-100 font-sans"
          : isStark
            ? "bg-[#070b13] text-cyan-100"
            : "bg-ocean-deep text-wano-cream",
      )}
    >
      {/* Dynamic Background Layout selection */}
      {isBatman ? (
        <BatmanBackground />
      ) : isStark ? (
        <TechGridBackground />
      ) : (
        <>
          <CherryBlossoms intensity="normal" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(123,45,142,0.06)_0%,transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(196,30,58,0.06)_0%,transparent_60%)] pointer-events-none" />
        </>
      )}
      <div
        className={cn(
          "w-full max-w-2xl mx-auto rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 backdrop-blur-md border-2",
          isBatman
            ? "bg-zinc-950/85 border-zinc-800 shadow-[0_0_30px_rgba(245,185,33,0.12)]"
            : isStark
              ? "bg-[#0B1528]/80 border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.15)]"
              : "bg-ocean-mid/45 border-ocean-surface/60 animate-drums-beat shadow-[0_15px_40px_rgba(0,0,0,0.4)] shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-shadow duration-500",
        )}
      >
        {/* Hand drawn / Cyber / Gotham corner HUD frames */}
        {isBatman ? (
          <>
            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-2 border-l-2 border-[#F5B921] pointer-events-none animate-pulse" />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-2 border-r-2 border-[#F5B921] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-2 border-l-2 border-[#F5B921] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-2 border-r-2 border-[#F5B921] pointer-events-none animate-pulse" />
          </>
        ) : isStark ? (
          <>
            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-2 border-l-2 border-[#00f0ff] pointer-events-none animate-pulse" />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-2 border-r-2 border-[#00f0ff] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-2 border-l-2 border-[#00f0ff] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-2 border-r-2 border-[#00f0ff] pointer-events-none animate-pulse" />
            <div className="absolute top-4 -left-1.5 w-1 h-3 bg-[#00f0ff]/50 pointer-events-none" />
            <div className="absolute top-4 -right-1.5 w-1 h-3 bg-[#00f0ff]/50 pointer-events-none" />
            <div className="absolute bottom-4 -left-1.5 w-1 h-3 bg-[#00f0ff]/50 pointer-events-none" />
            <div className="absolute bottom-4 -right-1.5 w-1 h-3 bg-[#00f0ff]/50 pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute -top-1.5 -left-1.5 w-8 h-8 border-t-4 border-l-4 border-wano-gold/50 rounded-tl-3xl pointer-events-none" />
            <div className="absolute -top-1.5 -right-1.5 w-8 h-8 border-t-4 border-r-4 border-wano-gold/50 rounded-tr-3xl pointer-events-none" />
            <div className="absolute -bottom-1.5 -left-1.5 w-8 h-8 border-b-4 border-l-4 border-wano-gold/50 rounded-bl-3xl pointer-events-none" />
            <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 border-b-4 border-r-4 border-wano-gold/50 rounded-br-3xl pointer-events-none" />

            {/* Straw Hat ornament at top-left corner */}
            <StrawHat className="absolute -top-7 -left-7 w-20 h-12 rotate-[-15deg] z-20 transition-all duration-300 hover:scale-110 hover:rotate-[-5deg] cursor-pointer drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]" />
          </>
        )}{" "}
        {/* Form Title & Description Header */}
        <div className="text-center space-y-3 pb-8 border-b border-ocean-surface/20 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            {isBatman ? (
              <>
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#F5B921]/60" />
                <span className="text-[10px] font-sans tracking-widest text-[#F5B921] uppercase animate-pulse">
                  🦇 GOTHAM KNIGHT SECURE RELAY 🦇
                </span>
                <div className="h-[1px] w-8 bg-gradient-to-r from-[#F5B921]/60 to-transparent" />
              </>
            ) : isStark ? (
              <>
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#00f0ff]/60" />
                <span className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase animate-pulse">
                  🛡️ STARK HOLOGRAPHIC DATA HUD 🛡️
                </span>
                <div className="h-[1px] w-8 bg-gradient-to-r from-[#00f0ff]/60 to-transparent" />
              </>
            ) : (
              <>
                <div className="h-0.5 w-8 bg-gradient-to-r from-transparent to-wano-gold/60" />
                <span className="text-[10px] font-bold tracking-widest text-wano-gold uppercase font-heading">
                  ⚓ GRAND LINE SURVEY DISPATCH ⚓
                </span>
                <div className="h-0.5 w-8 bg-gradient-to-r from-wano-gold/60 to-transparent" />
              </>
            )}
          </div>

          <div className="relative inline-block mt-3">
            {!isStark && !isBatman && (
              <StrawHat className="absolute -top-7 left-[50%] -translate-x-[50%] w-16 h-10 rotate-[-6deg] z-20 pointer-events-none drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)]" />
            )}
            {isBatman && (
              <div className="absolute -top-10 left-[50%] -translate-x-[50%] z-20 pointer-events-none filter drop-shadow-[0_2px_8px_rgba(245,185,33,0.35)]">
                <svg
                  viewBox="0 0 100 60"
                  className="w-14 h-9 fill-[#F5B921] stroke-[#8B6508] stroke-1 animate-pulse"
                >
                  <path d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z" />
                </svg>
              </div>
            )}
            <h1
              className={cn(
                "text-3xl sm:text-4xl font-extrabold tracking-wide drop-shadow-sm select-none relative z-10 pt-2 px-4 text-center",
                isBatman
                  ? "font-sans text-zinc-50 drop-shadow-[0_0_8px_rgba(245,185,33,0.4)] uppercase font-black"
                  : isStark
                    ? "font-mono text-cyan-50 drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] uppercase"
                    : "font-heading text-wano-cream",
              )}
            >
              {form.title}
            </h1>
          </div>

          {form.description && (
            <p
              className={cn(
                "text-xs sm:text-sm max-w-lg mx-auto leading-relaxed select-none",
                isBatman
                  ? "text-zinc-400 font-sans"
                  : isStark
                    ? "text-cyan-200/70 font-mono"
                    : "text-wano-cream/65 font-medium",
              )}
            >
              {form.description}
            </p>
          )}
        </div>
        {/* Interactive Form Submissions Area */}
        <div className="pt-8">
          <FormRenderer form={form} password={password} />
        </div>
      </div>

      {/* Branded Footer credits */}
      <div className="w-full text-center pt-10 select-none z-10 opacity-40 hover:opacity-75 transition-opacity duration-300">
        {isBatman ? (
          <p className="text-[9px] font-sans tracking-widest uppercase text-zinc-500 flex items-center justify-center gap-2">
            <span>POWERED BY WAYNE ENTERPRISES DISPATCH</span>
            <span className="text-[#F5B921] animate-pulse">♦</span>
            <span>BATMAN TACTICAL PROTOCOL</span>
          </p>
        ) : isStark ? (
          <p className="text-[9px] font-mono tracking-widest uppercase text-cyan-200/50 flex items-center justify-center gap-2">
            <span>POWERED BY AXEFORM INTEL NETWORK</span>
            <span className="text-[#00f0ff] animate-pulse">♦</span>
            <span>STARK SECURE TELEMETRY</span>
          </p>
        ) : (
          <p className="text-[9px] font-mono tracking-widest uppercase text-wano-cream/50 flex items-center justify-center gap-2">
            <span>POWERED BY AXEFORM PLATFORM</span>
            <span className="text-wano-crimson">♦</span>
            <span>WANO LANDING DIVISION</span>
          </p>
        )}
      </div>

      {!isStark && !isBatman && <WaveBackground position="bottom" className="opacity-15" />}
    </div>
  );
}
