"use client";

import Link from "next/link";
import { Anchor, Compass, Eye, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CherryBlossoms } from "~/components/ui/cherry-blossoms";
import { WaveBackground } from "~/components/ui/wave-background";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-32 px-6 overflow-hidden ocean-gradient">
      {/* Cherry Blossom Overlay */}
      <CherryBlossoms intensity="normal" />

      {/* Atmospheric Mist layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(36,83,128,0.15)_0%,_rgba(15,35,64,0)_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[300px] bg-gradient-to-r from-wano-sakura/5 to-fruit-purple/5 rounded-full filter blur-[120px] pointer-events-none animate-mist-drift" />

      <div className="max-w-6xl mx-auto text-center relative z-20 flex flex-col items-center">
        {/* Top Announcement pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ocean-surface/60 border border-wano-gold/30 text-wano-gold text-xs font-semibold uppercase tracking-wider mb-8 animate-float">
          <Sparkles className="w-3.5 h-3.5" />
          The Latest Update is Here
        </div>

        {/* Epic Main Heading */}
        <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold text-wano-cream tracking-wide leading-tight max-w-4xl relative">
          Build Beautiful Forms with{" "}
          <span className="text-gradient-gold block md:inline font-black">AxeForm</span>
        </h1>

        {/* Decorative brush underline */}
        <div
          className="w-48 h-3.5 mt-3 bg-gradient-to-r from-wano-crimson via-wano-gold to-transparent rounded-full"
          style={{
            clipPath:
              "polygon(0% 40%, 15% 30%, 40% 60%, 65% 40%, 85% 65%, 100% 50%, 95% 80%, 75% 60%, 50% 80%, 25% 60%, 0% 70%)",
          }}
        />

        {/* Subtitle description */}
        <p className="text-wano-cream/75 text-base sm:text-lg md:text-xl max-w-3xl mt-8 leading-relaxed font-light">
          <strong>AxeForm</strong> is a powerful, dynamic drag-and-drop form builder. Create elegant
          surveys, secure your inputs with password protection, and export actionable insights with
          real-time analytics — all with a stunning visual experience. Customize field types,
          add password protection, and track performance with built-in analytics.
        </p>

        {/* Actions CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-10 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto btn-crimson rounded-xl px-8 py-7 text-base font-bold flex items-center justify-center gap-2">
              <Anchor className="w-5 h-5" />
              Get Started Free
            </Button>
          </Link>
          <Link href="/explore" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto btn-gold-outline rounded-xl px-8 py-7 text-base font-bold flex items-center justify-center gap-2">
              <Compass className="w-5 h-5" />
              Explore Public Forms
            </Button>
          </Link>
        </div>

        {/* Interactive Mockup Illustration */}
        <div className="mt-20 w-full max-w-4xl glass-panel rounded-2xl p-4 border border-ocean-surface/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-[1.01] relative group">
          {/* Custom Haki glow on hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-wano-crimson/10 to-fruit-purple/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 pointer-events-none" />

          {/* Sketchy Mockup Interior */}
          <div className="rounded-xl overflow-hidden bg-ocean-deep/90 border border-ocean-surface p-4 flex flex-col gap-4 text-left">
            {/* Mock Top bar */}
            <div className="flex items-center justify-between pb-3 border-b border-ocean-surface/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-wano-crimson opacity-80" />
                <span className="w-3 h-3 rounded-full bg-wano-gold opacity-80" />
                <span className="w-3 h-3 rounded-full bg-fruit-glow opacity-80" />
                <span className="text-xs text-wano-cream/40 font-mono ml-4">
                  axeform.app/f/team-feedback-survey
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-wano-gold">
                <ShieldCheck className="w-4 h-4 text-fruit-glow" />
                <span>Password Protected</span>
              </div>
            </div>

            {/* Mock layout body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
              {/* Field 1 */}
              <div className="md:col-span-2 rounded-xl p-4 bg-ocean-mid border border-wano-gold/10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-wano-crimson/10 text-wano-crimson border border-wano-crimson/25 font-heading">
                    Short Text Field
                  </span>
                  <span className="text-xs text-wano-cream/40">Field #1</span>
                </div>
                <div className="text-sm font-heading text-wano-cream">
                  What is your biggest goal this year?
                </div>
                <div className="w-full h-10 rounded bg-ocean-deep border border-ocean-surface px-3 flex items-center text-xs text-wano-cream/30">
                  e.g. Launch my own startup
                </div>
              </div>

              {/* Sidebar helper */}
              <div className="rounded-xl p-4 bg-ocean-surface/30 border border-ocean-surface flex flex-col gap-4">
                <span className="text-xs text-wano-gold font-heading uppercase tracking-wider">
                  Form Fields
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 p-2 rounded bg-ocean-mid text-xs text-wano-cream/70 border border-ocean-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-fruit-purple" />
                    Star Rating
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-ocean-mid text-xs text-wano-cream/70 border border-ocean-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-wano-crimson" />
                    Email Address
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ocean Waves at bottom */}
      <WaveBackground position="bottom" />
    </section>
  );
}
