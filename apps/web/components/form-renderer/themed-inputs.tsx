"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Check } from "lucide-react";

// ==========================================
// 1. TEXT INPUTS (Short Text, Email, Number)
// ==========================================

interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  themeName?: string;
}

export function ThemedInput({
  label,
  error,
  required,
  className,
  type = "text",
  themeName = "wano",
  ...props
}: ThemedInputProps) {
  const isStark = themeName === "stark";
  const isBatman = themeName === "batman";
  return (
    <div className="space-y-2">
      <Label
        className={cn(
          "text-xs font-semibold uppercase tracking-wider flex items-center gap-1",
          isBatman
            ? "text-[#F5B921]/90 font-sans tracking-widest"
            : isStark
              ? "text-[#00f0ff]/90 font-mono"
              : "text-wano-gold/90 font-heading",
        )}
      >
        {label}
        {required && (
          <span
            className={cn(
              "font-black animate-pulse",
              isBatman ? "text-[#F5B921]" : isStark ? "text-[#00f0ff]" : "text-wano-crimson",
            )}
          >
            *
          </span>
        )}
      </Label>
      <div className="relative group">
        <Input
          type={type}
          className={cn(
            "bg-ocean-mid/50 border-2 border-ocean-surface text-wano-cream rounded-xl text-sm px-4 py-3 h-11 focus-visible:ring-0 group-hover:border-ocean-surface/80 focus:border-wano-gold/60 focus:shadow-[0_0_15px_rgba(255,255,255,0.25)] focus:border-wano-sakura/50 placeholder:text-wano-cream/30 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] font-sans relative z-10 shadow-inner",
            isStark &&
              "bg-[#0B1528]/60 border-[#00f0ff]/20 text-cyan-50 focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.15)] font-mono placeholder:text-cyan-200/20 group-hover:border-[#00f0ff]/40",
            isBatman &&
              "bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:border-[#F5B921] focus:shadow-[0_0_12px_rgba(245,185,33,0.2)] font-sans placeholder:text-zinc-500 group-hover:border-zinc-700",
            error &&
              (isBatman
                ? "border-[#F5B921]/50 focus:border-[#F5B921]"
                : isStark
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-wano-crimson/50 focus:border-wano-crimson"),
            className,
          )}
          {...props}
        />
        {/* Underline brush accent on focus */}
        <div
          className={cn(
            "absolute bottom-0 left-4 right-4 h-[2px] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-center z-20 pointer-events-none rounded-full opacity-80",
            isBatman
              ? "bg-gradient-to-r from-zinc-800 via-[#F5B921] to-zinc-800 shadow-[0_0_8px_#F5B921]"
              : isStark
                ? "bg-gradient-to-r from-[#00f0ff] via-cyan-400 to-blue-500 shadow-[0_0_8px_#00f0ff]"
                : "bg-gradient-to-r from-wano-crimson via-wano-gold to-wano-sakura",
          )}
        />
      </div>
      {error && (
        <p
          className={cn(
            "text-[10px] font-semibold animate-shake pl-1",
            isBatman
              ? "text-[#F5B921] font-sans"
              : isStark
                ? "text-red-400 font-mono"
                : "text-wano-crimson font-heading",
          )}
        >
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

// ==========================================
// 2. TEXTAREA (Long Text)
// ==========================================

interface ThemedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
  themeName?: string;
}

export function ThemedTextarea({
  label,
  error,
  required,
  className,
  themeName = "wano",
  ...props
}: ThemedTextareaProps) {
  const isStark = themeName === "stark";
  const isBatman = themeName === "batman";
  return (
    <div className="space-y-2">
      <Label
        className={cn(
          "text-xs font-semibold uppercase tracking-wider flex items-center gap-1",
          isBatman
            ? "text-[#F5B921]/90 font-sans tracking-widest"
            : isStark
              ? "text-[#00f0ff]/90 font-mono"
              : "text-wano-gold/90 font-heading",
        )}
      >
        {label}
        {required && (
          <span
            className={cn(
              "font-black animate-pulse",
              isBatman ? "text-[#F5B921]" : isStark ? "text-[#00f0ff]" : "text-wano-crimson",
            )}
          >
            *
          </span>
        )}
      </Label>
      <div className="relative group">
        <Textarea
          className={cn(
            "bg-ocean-mid/50 border-2 border-ocean-surface text-wano-cream rounded-xl text-sm px-4 py-3 min-h-28 focus-visible:ring-0 group-hover:border-ocean-surface/80 focus:border-wano-gold/60 focus:shadow-[0_0_15px_rgba(255,255,255,0.25)] focus:border-wano-sakura/50 placeholder:text-wano-cream/30 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] font-sans relative z-10 shadow-inner resize-none",
            isStark &&
              "bg-[#0B1528]/60 border-[#00f0ff]/20 text-cyan-50 focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.15)] font-mono placeholder:text-cyan-200/20 group-hover:border-[#00f0ff]/40",
            isBatman &&
              "bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:border-[#F5B921] focus:shadow-[0_0_12px_rgba(245,185,33,0.2)] font-sans placeholder:text-zinc-500 group-hover:border-zinc-700",
            error &&
              (isBatman
                ? "border-[#F5B921]/50 focus:border-[#F5B921]"
                : isStark
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-wano-crimson/50 focus:border-wano-crimson"),
            className,
          )}
          {...props}
        />
        {/* Underline brush accent on focus */}
        <div
          className={cn(
            "absolute bottom-1 left-4 right-4 h-[2px] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-center z-20 pointer-events-none rounded-full opacity-80",
            isBatman
              ? "bg-gradient-to-r from-zinc-800 via-[#F5B921] to-zinc-800 shadow-[0_0_8px_#F5B921]"
              : isStark
                ? "bg-gradient-to-r from-[#00f0ff] via-cyan-400 to-blue-500 shadow-[0_0_8px_#00f0ff]"
                : "bg-gradient-to-r from-wano-crimson via-wano-gold to-wano-sakura",
          )}
        />
      </div>
      {error && (
        <p
          className={cn(
            "text-[10px] font-semibold animate-shake pl-1",
            isBatman
              ? "text-[#F5B921] font-sans"
              : isStark
                ? "text-red-400 font-mono"
                : "text-wano-crimson font-heading",
          )}
        >
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

// ==========================================
// 3. SINGLE SELECT (Hana Hana Single Pick)
// ==========================================

interface Option {
  label: string;
  value: string;
  id?: string;
}

interface ThemedSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
  themeName?: string;
}

export function ThemedSelect({
  label,
  options,
  value,
  onChange,
  error,
  required,
  themeName = "wano",
}: ThemedSelectProps) {
  const isStark = themeName === "stark";
  const isBatman = themeName === "batman";
  return (
    <div className="space-y-2">
      <Label
        className={cn(
          "text-xs font-semibold uppercase tracking-wider flex items-center gap-1",
          isBatman
            ? "text-[#F5B921]/90 font-sans tracking-widest"
            : isStark
              ? "text-[#00f0ff]/90 font-mono"
              : "text-wano-gold/90 font-heading",
        )}
      >
        {label}
        {required && (
          <span
            className={cn(
              "font-black animate-pulse",
              isBatman ? "text-[#F5B921]" : isStark ? "text-[#00f0ff]" : "text-wano-crimson",
            )}
          >
            *
          </span>
        )}
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "p-3.5 text-left rounded-xl border-2 text-xs font-medium transition-all duration-300 relative overflow-hidden group select-none shadow-sm flex items-center justify-between",
                isBatman
                  ? isSelected
                    ? "bg-zinc-900/80 border-[#F5B921] text-zinc-100 shadow-[0_0_15px_rgba(245,185,33,0.15)] font-sans"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900/60 hover:border-zinc-700 hover:text-zinc-200 font-sans"
                  : isStark
                    ? isSelected
                      ? "bg-[#00f0ff]/10 border-[#00f0ff] text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.2)] font-mono"
                      : "bg-[#0B1528]/30 border-[#00f0ff]/10 text-cyan-200/60 hover:bg-[#0B1528]/50 hover:border-[#00f0ff]/40 font-mono"
                    : isSelected
                      ? "bg-wano-gold/15 border-wano-gold text-wano-cream shadow-[0_0_15px_rgba(201,168,76,0.15)] shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-[1.02] duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                      : "bg-ocean-mid/30 border-ocean-surface text-wano-cream/70 hover:bg-ocean-mid/50 hover:border-ocean-surface/80 hover:scale-[1.01] duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
              )}
            >
              {/* Conic background swirl effect on active choice */}
              {isSelected && !isStark && !isBatman && (
                <div
                  className="absolute inset-0 fruit-swirl-subtle opacity-5 rounded-xl pointer-events-none scale-150 animate-spin"
                  style={{ animationDuration: "20s" }}
                />
              )}
              {isSelected && isStark && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.1)_0%,transparent_100%)] pointer-events-none animate-pulse" />
              )}
              {isSelected && isBatman && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,185,33,0.06)_0%,transparent_100%)] pointer-events-none animate-pulse" />
              )}

              <span
                className={cn(
                  "relative z-10",
                  isBatman ? "font-sans font-semibold" : isStark ? "font-mono" : "font-heading",
                )}
              >
                {opt.label}
              </span>

              <div
                className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all z-10",
                  isBatman
                    ? isSelected
                      ? "border-[#F5B921] bg-[#F5B921] text-[#0B0C10]"
                      : "border-zinc-800 bg-zinc-900/60"
                    : isStark
                      ? isSelected
                        ? "border-[#00f0ff] bg-[#00f0ff] text-[#0A1628]"
                        : "border-[#00f0ff]/20 bg-[#0B1528]/50"
                      : isSelected
                        ? "border-wano-gold bg-wano-gold text-ocean-deep"
                        : "border-ocean-surface bg-ocean-deep/50",
                )}
              >
                {isSelected && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
              </div>
            </button>
          );
        })}
      </div>
      {error && (
        <p
          className={cn(
            "text-[10px] font-semibold animate-shake pl-1",
            isBatman
              ? "text-[#F5B921] font-sans"
              : isStark
                ? "text-red-400 font-mono"
                : "text-wano-crimson font-heading",
          )}
        >
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

// ==========================================
// 4. MULTI SELECT (Kage Kage Shadow Select)
// ==========================================

interface ThemedMultiSelectProps {
  label: string;
  options: Option[];
  value: string[];
  onChange: (val: string[]) => void;
  error?: string;
  required?: boolean;
  themeName?: string;
}

export function ThemedMultiSelect({
  label,
  options,
  value = [],
  onChange,
  error,
  required,
  themeName = "wano",
}: ThemedMultiSelectProps) {
  const isStark = themeName === "stark";
  const isBatman = themeName === "batman";
  const handleToggle = (optValue: string) => {
    const nextVal = value.includes(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange(nextVal);
  };

  return (
    <div className="space-y-2">
      <Label
        className={cn(
          "text-xs font-semibold uppercase tracking-wider flex items-center gap-1",
          isBatman
            ? "text-[#F5B921]/90 font-sans tracking-widest"
            : isStark
              ? "text-[#00f0ff]/90 font-mono"
              : "text-wano-gold/90 font-heading",
        )}
      >
        {label}
        {required && (
          <span
            className={cn(
              "font-black animate-pulse",
              isBatman ? "text-[#F5B921]" : isStark ? "text-[#00f0ff]" : "text-wano-crimson",
            )}
          >
            *
          </span>
        )}
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleToggle(opt.value)}
              className={cn(
                "p-3.5 text-left rounded-xl border-2 text-xs font-medium transition-all duration-300 relative overflow-hidden group select-none shadow-sm flex items-center justify-between",
                isBatman
                  ? isSelected
                    ? "bg-zinc-900/80 border-[#F5B921] text-zinc-100 shadow-[0_0_15px_rgba(245,185,33,0.15)] font-sans"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900/60 hover:border-zinc-700 hover:text-zinc-200 font-sans"
                  : isStark
                    ? isSelected
                      ? "bg-[#00f0ff]/10 border-[#00f0ff] text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.2)] font-mono"
                      : "bg-[#0B1528]/30 border-[#00f0ff]/10 text-cyan-200/60 hover:bg-[#0B1528]/50 hover:border-[#00f0ff]/40 font-mono"
                    : isSelected
                      ? "bg-fruit-purple/15 border-fruit-purple text-wano-cream shadow-[0_0_15px_rgba(123,45,142,0.15)] shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-[1.02] duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                      : "bg-ocean-mid/30 border-ocean-surface text-wano-cream/70 hover:bg-ocean-mid/50 hover:border-ocean-surface/80 hover:scale-[1.01] duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
              )}
            >
              {/* Conic background swirl effect on active choice */}
              {isSelected && !isStark && !isBatman && (
                <div
                  className="absolute inset-0 fruit-swirl-subtle opacity-5 rounded-xl pointer-events-none scale-150 animate-spin"
                  style={{ animationDuration: "20s" }}
                />
              )}
              {isSelected && isStark && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.1)_0%,transparent_100%)] pointer-events-none animate-pulse" />
              )}
              {isSelected && isBatman && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,185,33,0.06)_0%,transparent_100%)] pointer-events-none animate-pulse" />
              )}

              <span
                className={cn(
                  "relative z-10",
                  isBatman ? "font-sans font-semibold" : isStark ? "font-mono" : "font-heading",
                )}
              >
                {opt.label}
              </span>

              <div
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all z-10",
                  isBatman
                    ? isSelected
                      ? "border-[#F5B921] bg-[#F5B921] text-[#0B0C10]"
                      : "border-zinc-800 bg-zinc-900/60"
                    : isStark
                      ? isSelected
                        ? "border-[#00f0ff] bg-[#00f0ff] text-[#0A1628]"
                        : "border-[#00f0ff]/20 bg-[#0B1528]/50"
                      : isSelected
                        ? "border-fruit-purple bg-fruit-purple text-wano-cream"
                        : "border-ocean-surface bg-ocean-deep/50",
                )}
              >
                {isSelected && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
              </div>
            </button>
          );
        })}
      </div>
      {error && (
        <p
          className={cn(
            "text-[10px] font-semibold animate-shake pl-1",
            isBatman
              ? "text-[#F5B921] font-sans"
              : isStark
                ? "text-red-400 font-mono"
                : "text-wano-crimson font-heading",
          )}
        >
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

// ==========================================
// 5. CHECKBOX (Sube Sube Smooth Switch)
// ==========================================

interface ThemedCheckboxProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
  error?: string;
  required?: boolean;
  themeName?: string;
}

export function ThemedCheckbox({
  label,
  value,
  onChange,
  error,
  required,
  themeName = "wano",
}: ThemedCheckboxProps) {
  const isStark = themeName === "stark";
  const isBatman = themeName === "batman";
  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-start gap-3 p-4 border-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
          isBatman
            ? "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
            : isStark
              ? "bg-[#0B1528]/40 border-[#00f0ff]/20 hover:border-[#00f0ff]/40"
              : "bg-ocean-mid/20 border-ocean-surface hover:border-ocean-surface/80 hover:scale-[1.01]",
        )}
      >
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={cn(
            "w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] select-none",
            isBatman
              ? value
                ? "border-[#F5B921] bg-[#F5B921] text-[#0B0C10] shadow-[0_0_10px_rgba(245,185,33,0.25)]"
                : "border-zinc-800 bg-zinc-900/60"
              : isStark
                ? value
                  ? "border-[#00f0ff] bg-[#00f0ff] text-[#0A1628] shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                  : "border-[#00f0ff]/30 bg-[#0B1528]/50"
                : value
                  ? "border-wano-crimson bg-wano-crimson text-wano-cream shadow-[0_0_10px_rgba(196,30,58,0.25)] shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-110"
                  : "border-ocean-surface bg-ocean-deep/50",
          )}
        >
          {value && <Check className="w-3.5 h-3.5 stroke-[4px]" />}
        </button>

        <Label
          onClick={() => onChange(!value)}
          className={cn(
            "text-xs font-semibold leading-relaxed cursor-pointer select-none",
            isBatman
              ? "text-zinc-100/80 font-sans font-semibold"
              : isStark
                ? "text-cyan-100/80 font-mono"
                : "text-wano-cream/80 font-heading",
          )}
        >
          {label}
          {required && (
            <span
              className={cn(
                "font-black ml-1 animate-pulse",
                isBatman ? "text-[#F5B921]" : isStark ? "text-[#00f0ff]" : "text-wano-crimson",
              )}
            >
              *
            </span>
          )}
        </Label>
      </div>
      {error && (
        <p
          className={cn(
            "text-[10px] font-semibold animate-shake pl-1",
            isStark ? "text-red-400 font-mono" : "text-wano-crimson font-heading",
          )}
        >
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

// ==========================================
// 6. RATING (Gura Gura Skull Rating)
// ==========================================

interface ThemedRatingProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  error?: string;
  required?: boolean;
  themeName?: string;
}

export function ThemedRating({
  label,
  value = 0,
  onChange,
  error,
  required,
  themeName = "wano",
}: ThemedRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const isStark = themeName === "stark";
  const isBatman = themeName === "batman";
  const displayRating = hoverRating !== null ? hoverRating : value;

  return (
    <div className="space-y-2">
      <Label
        className={cn(
          "text-xs font-semibold uppercase tracking-wider flex items-center gap-1",
          isBatman
            ? "text-[#F5B921]/90 font-sans tracking-widest"
            : isStark
              ? "text-[#00f0ff]/90 font-mono"
              : "text-wano-gold/90 font-heading",
        )}
      >
        {label}
        {required && (
          <span
            className={cn(
              "font-black animate-pulse",
              isBatman ? "text-[#F5B921]" : isStark ? "text-[#00f0ff]" : "text-wano-crimson",
            )}
          >
            *
          </span>
        )}
      </Label>
      <div className="flex items-center gap-2.5 py-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = displayRating >= star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className="focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] active:scale-90 hover:scale-120"
            >
              {isBatman ? (
                /* Batman Bat-Symbol Rating SVG */
                <svg
                  viewBox="0 0 100 60"
                  className={cn(
                    "w-10 h-7 transition-all duration-300",
                    isActive
                      ? "fill-[#F5B921] stroke-[#8B6508] drop-shadow-[0_0_8px_rgba(245,185,33,0.6)]"
                      : "fill-transparent stroke-zinc-700 hover:stroke-[#F5B921]/50",
                  )}
                >
                  <path
                    d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z"
                    strokeWidth="2"
                  />
                </svg>
              ) : isStark ? (
                /* Futuristic Arc Reactor HUD SVG */
                <svg
                  viewBox="0 0 24 24"
                  className={cn(
                    "w-9 h-9 stroke-[1.5] transition-all duration-300",
                    isActive
                      ? "fill-[#00f0ff]/20 stroke-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                      : "fill-transparent stroke-[#00f0ff]/20 hover:stroke-[#00f0ff]/50",
                  )}
                >
                  <circle cx="12" cy="12" r="9" strokeDasharray="3 1.5" fill="none" />
                  <circle
                    cx="12"
                    cy="12"
                    r="5"
                    className={isActive ? "fill-[#00f0ff]" : "fill-none"}
                  />
                  <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                </svg>
              ) : (
                /* Hand-drawn Jolly Roger Skull SVG */
                <svg
                  viewBox="0 0 24 24"
                  className={cn(
                    "w-9 h-9 stroke-[1.5] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                    isActive
                      ? "fill-wano-gold stroke-wano-gold drop-shadow-[0_0_8px_rgba(201,168,76,0.6)] drop-shadow-[0_0_12px_rgba(255,255,255,0.85)] scale-110"
                      : "fill-transparent stroke-ocean-surface hover:stroke-wano-gold/50 hover:scale-115",
                  )}
                >
                  <path d="M12 2C8.68 2 6 4.68 6 8c0 2.21 1.21 4.12 3 5.15v2.85c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.85c1.79-1.03 3-2.94 3-5.15 0-3.32-2.68-6-6-6zm-2 6c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm5 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1z" />
                  <path d="M4 20l3.5-3.5M20 20l-3.5-3.5M4 4l3.5 3.5M20 4l-3.5 3.5" />
                </svg>
              )}
            </button>
          );
        })}
        {value > 0 && (
          <span
            className={cn(
              "text-xs font-bold pl-2",
              isBatman
                ? "text-[#F5B921]/80 font-sans tracking-wide"
                : isStark
                  ? "text-[#00f0ff]/80 font-mono"
                  : "text-wano-gold/80 font-heading",
            )}
          >
            {isBatman
              ? `(${value} / 5 BAT-SYMBOLS DETECTED)`
              : isStark
                ? `(${value} / 5 CORES ACTIVE)`
                : `(${value} / 5 Bounty)`}
          </span>
        )}
      </div>
      {error && (
        <p
          className={cn(
            "text-[10px] font-semibold animate-shake pl-1",
            isBatman
              ? "text-[#F5B921] font-sans"
              : isStark
                ? "text-red-400 font-mono"
                : "text-wano-crimson font-heading",
          )}
        >
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

// ==========================================
// 7. DATE (Toki Toki Scroll Calendar)
// ==========================================

interface ThemedDateProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  themeName?: string;
}

export function ThemedDate({
  label,
  error,
  required,
  className,
  themeName = "wano",
  ...props
}: ThemedDateProps) {
  const isStark = themeName === "stark";
  const isBatman = themeName === "batman";
  return (
    <div className="space-y-2">
      <Label
        className={cn(
          "text-xs font-semibold uppercase tracking-wider flex items-center gap-1",
          isBatman
            ? "text-[#F5B921]/90 font-sans tracking-widest"
            : isStark
              ? "text-[#00f0ff]/90 font-mono"
              : "text-wano-gold/90 font-heading",
        )}
      >
        {label}
        {required && (
          <span
            className={cn(
              "font-black ml-0.5 animate-pulse",
              isBatman ? "text-[#F5B921]" : isStark ? "text-[#00f0ff]" : "text-wano-crimson",
            )}
          >
            *
          </span>
        )}
      </Label>
      <div className="relative group">
        <Input
          type="date"
          className={cn(
            "bg-ocean-mid/50 border-2 border-ocean-surface text-wano-cream rounded-xl text-sm px-4 py-3 h-11 focus-visible:ring-0 group-hover:border-ocean-surface/80 focus:border-wano-gold/60 focus:shadow-[0_0_15px_rgba(255,255,255,0.25)] focus:border-wano-sakura/50 placeholder:text-wano-cream/30 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] font-sans relative z-10 shadow-inner w-full sm:w-56 calendar-picker-indicator:filter calendar-picker-indicator:invert",
            isStark &&
              "bg-[#0B1528]/60 border-[#00f0ff]/20 text-cyan-50 focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.15)] font-mono placeholder:text-cyan-200/20 group-hover:border-[#00f0ff]/40 calendar-picker-indicator:filter calendar-picker-indicator:hue-rotate-180 calendar-picker-indicator:brightness-125",
            isBatman &&
              "bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:border-[#F5B921] focus:shadow-[0_0_12px_rgba(245,185,33,0.2)] font-sans placeholder:text-zinc-500 group-hover:border-zinc-700 calendar-picker-indicator:filter calendar-picker-indicator:invert calendar-picker-indicator:brightness-90",
            error &&
              (isBatman
                ? "border-[#F5B921]/50 focus:border-[#F5B921]"
                : isStark
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-wano-crimson/50 focus:border-wano-crimson"),
            className,
          )}
          {...props}
        />
        {/* Underline brush accent on focus */}
        <div
          className={cn(
            "absolute bottom-0 left-4 right-4 h-[2px] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-center z-20 pointer-events-none rounded-full opacity-80",
            isBatman
              ? "bg-gradient-to-r from-zinc-800 via-[#F5B921] to-zinc-800 shadow-[0_0_8px_#F5B921]"
              : isStark
                ? "bg-gradient-to-r from-[#00f0ff] via-cyan-400 to-blue-500 shadow-[0_0_8px_#00f0ff]"
                : "bg-gradient-to-r from-wano-crimson via-wano-gold to-wano-sakura",
          )}
        />
      </div>
      {error && (
        <p
          className={cn(
            "text-[10px] font-semibold animate-shake pl-1",
            isBatman
              ? "text-[#F5B921] font-sans"
              : isStark
                ? "text-red-400 font-mono"
                : "text-wano-crimson font-heading",
          )}
        >
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
