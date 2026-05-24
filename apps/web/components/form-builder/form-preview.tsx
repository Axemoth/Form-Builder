"use client";

import { useState } from "react";
import { Compass, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { StrawHat } from "~/components/ui/straw-hat";
import {
  ThemedInput,
  ThemedTextarea,
  ThemedSelect,
  ThemedMultiSelect,
  ThemedCheckbox,
  ThemedRating,
  ThemedDate,
} from "~/components/form-renderer/themed-inputs";

interface FormFieldPreview {
  id?: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: Array<{ label: string; value: string; order: number }>;
}

interface FormPreviewProps {
  title: string;
  description: string | null;
  fields: FormFieldPreview[];
  submitButtonText?: string;
  themeName?: string;
}

export function FormPreview({
  title,
  description,
  fields,
  submitButtonText = "Send Your Response",
  themeName = "wano",
}: FormPreviewProps) {
  const isStark = themeName === "stark";
  const isBatman = themeName === "batman";
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  // Local state to serve as an interactive playground sandbox
  const [mockValues, setMockValues] = useState<Record<string, any>>({});

  return (
    <div
      className={cn(
        "rounded-2xl p-6 md:p-8 flex flex-col gap-6 max-w-2xl mx-auto my-4 relative min-h-[500px] border-2 transition-all duration-300",
        isBatman
          ? "bg-zinc-950/90 border-zinc-800 shadow-[0_0_30px_rgba(245,185,33,0.12)] text-zinc-100 font-sans"
          : isStark
            ? "bg-[#0B1528]/80 border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.15)] text-cyan-100 font-mono"
            : "bg-ocean-mid/45 text-wano-cream border-ocean-surface/60 font-sans animate-drums-beat shadow-[0_15px_40px_rgba(0,0,0,0.4)] shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-shadow duration-500",
      )}
    >
      {/* Hand drawn / Cyber / Gotham corner HUD frames & Straw Hat */}
      {isBatman ? (
        <>
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#F5B921] pointer-events-none animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#F5B921] pointer-events-none animate-pulse" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#F5B921] pointer-events-none animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#F5B921] pointer-events-none animate-pulse" />
        </>
      ) : isStark ? (
        <>
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00f0ff] pointer-events-none animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#00f0ff] pointer-events-none animate-pulse" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#00f0ff] pointer-events-none animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00f0ff] pointer-events-none animate-pulse" />
        </>
      ) : (
        <>
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-wano-gold/50 rounded-tl-2xl pointer-events-none" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-wano-gold/50 rounded-tr-2xl pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-wano-gold/50 rounded-bl-2xl pointer-events-none" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-wano-gold/50 rounded-br-2xl pointer-events-none" />

          {/* Straw Hat ornament at top-left corner */}
          <StrawHat className="absolute -top-6 -left-6 w-16 h-10 rotate-[-15deg] z-20 transition-all duration-300 hover:scale-110 hover:rotate-[-5deg] cursor-pointer drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.85)]" />
        </>
      )}

      {/* Decorative Wano Cloud/Cyber headers */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-60 text-xs select-none z-10">
        {isBatman ? (
          <span className="text-[9px] font-sans tracking-widest text-[#F5B921] uppercase animate-pulse">
            GOTHAM COM LINK ONLINE
          </span>
        ) : isStark ? (
          <span className="text-[9px] font-mono tracking-widest text-[#00f0ff] uppercase animate-pulse">
            STARK HUD ACTIVE
          </span>
        ) : (
          <>
            <Compass className="w-4 h-4 animate-spin-slow text-wano-gold" />
            <span className="text-wano-gold font-heading text-[10px] uppercase tracking-wider">
              Grand Line Island View
            </span>
          </>
        )}
      </div>

      {/* Header section */}
      <div
        className={cn(
          "border-b pb-6 mt-4 relative text-center flex flex-col items-center",
          isBatman ? "border-zinc-800" : isStark ? "border-[#00f0ff]/20" : "border-wano-gold/30",
        )}
      >
        <div className="relative inline-block mt-4">
          {!isStark && !isBatman && (
            <StrawHat className="absolute -top-7 left-[50%] -translate-x-[50%] w-14 h-9 rotate-[-6deg] z-20 pointer-events-none drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)]" />
          )}
          {isBatman && (
            <div className="absolute -top-9 left-[50%] -translate-x-[50%] z-20 pointer-events-none filter drop-shadow-[0_2px_8px_rgba(245,185,33,0.35)]">
              <svg
                viewBox="0 0 100 60"
                className="w-12 h-7 fill-[#F5B921] stroke-[#8B6508] stroke-1"
              >
                <path d="M 50,16 C 46,11 43,10 41,10 C 34,10 28,15 12,10 C 6,8 0,12 0,17 C 0,23 6,26 18,28 C 30,30 36,27 41,32 C 43,34 45,40 48,44 C 51,40 53,34 55,32 C 60,27 66,30 78,28 C 90,26 96,23 96,17 C 96,12 90,8 84,10 C 68,15 62,10 55,10 C 53,10 50,11 46,16 Z" />
              </svg>
            </div>
          )}
          <h2
            className={cn(
              "text-2xl font-extrabold tracking-wide mb-2 select-none relative z-10 pt-2 px-4 text-center",
              isBatman
                ? "font-sans text-zinc-50 drop-shadow-[0_0_8px_rgba(245,185,33,0.3)] uppercase tracking-wider font-black"
                : isStark
                  ? "font-mono text-cyan-50 drop-shadow-[0_0_6px_rgba(0,240,255,0.3)] uppercase"
                  : "font-heading text-wano-cream",
            )}
          >
            {title || "Gotham Signals"}
          </h2>
        </div>
        {description && (
          <p
            className={cn(
              "text-xs sm:text-sm leading-relaxed max-w-md mx-auto text-center mt-1",
              isBatman
                ? "text-zinc-400 font-sans"
                : isStark
                  ? "text-cyan-200/70 font-mono"
                  : "text-wano-cream/70 italic",
            )}
          >
            {description}
          </p>
        )}
      </div>

      {/* Fields Preview Render Loop */}
      <div className="space-y-6 flex-1 py-4">
        {sortedFields.length > 0 ? (
          sortedFields.map((field, idx) => {
            const options = field.options || [];
            const fieldId = field.id || `field-${idx}`;

            return (
              <div
                key={fieldId}
                className={cn(
                  "p-5 rounded-2xl border space-y-4 transition-all duration-300 animate-slide-up",
                  isBatman
                    ? "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
                    : isStark
                      ? "bg-[#0B1528]/30 border-[#00f0ff]/10 hover:border-[#00f0ff]/30"
                      : "bg-ocean-mid/20 border-ocean-surface/30 hover:border-wano-gold/10",
                )}
              >
                {field.type === "short_text" && (
                  <ThemedInput
                    label={field.label || `Field ${idx + 1}`}
                    placeholder={field.placeholder || "Your text answer..."}
                    required={field.required}
                    themeName={themeName}
                    value={mockValues[fieldId] || ""}
                    onChange={(e) =>
                      setMockValues((prev) => ({ ...prev, [fieldId]: e.target.value }))
                    }
                  />
                )}

                {field.type === "long_text" && (
                  <ThemedTextarea
                    label={field.label || `Field ${idx + 1}`}
                    placeholder={field.placeholder || "Write your descriptive reply..."}
                    required={field.required}
                    themeName={themeName}
                    value={mockValues[fieldId] || ""}
                    onChange={(e) =>
                      setMockValues((prev) => ({ ...prev, [fieldId]: e.target.value }))
                    }
                  />
                )}

                {field.type === "email" && (
                  <ThemedInput
                    type="email"
                    label={field.label || `Field ${idx + 1}`}
                    placeholder={field.placeholder || "bruce@gotham.com"}
                    required={field.required}
                    themeName={themeName}
                    value={mockValues[fieldId] || ""}
                    onChange={(e) =>
                      setMockValues((prev) => ({ ...prev, [fieldId]: e.target.value }))
                    }
                  />
                )}

                {field.type === "number" && (
                  <ThemedInput
                    type="number"
                    label={field.label || `Field ${idx + 1}`}
                    placeholder={field.placeholder || "Enter quantity..."}
                    required={field.required}
                    themeName={themeName}
                    value={mockValues[fieldId] === undefined ? "" : mockValues[fieldId]}
                    onChange={(e) =>
                      setMockValues((prev) => ({ ...prev, [fieldId]: e.target.value }))
                    }
                  />
                )}

                {field.type === "single_select" && (
                  <ThemedSelect
                    label={field.label || `Field ${idx + 1}`}
                    options={options}
                    required={field.required}
                    themeName={themeName}
                    value={mockValues[fieldId] || ""}
                    onChange={(val) => setMockValues((prev) => ({ ...prev, [fieldId]: val }))}
                  />
                )}

                {field.type === "multi_select" && (
                  <ThemedMultiSelect
                    label={field.label || `Field ${idx + 1}`}
                    options={options}
                    required={field.required}
                    themeName={themeName}
                    value={mockValues[fieldId] || []}
                    onChange={(val) => setMockValues((prev) => ({ ...prev, [fieldId]: val }))}
                  />
                )}

                {field.type === "checkbox" && (
                  <ThemedCheckbox
                    label={field.label || `Field ${idx + 1}`}
                    required={field.required}
                    themeName={themeName}
                    value={!!mockValues[fieldId]}
                    onChange={(val) => setMockValues((prev) => ({ ...prev, [fieldId]: val }))}
                  />
                )}

                {field.type === "rating" && (
                  <ThemedRating
                    label={field.label || `Field ${idx + 1}`}
                    required={field.required}
                    themeName={themeName}
                    value={Number(mockValues[fieldId] || 0)}
                    onChange={(val) => setMockValues((prev) => ({ ...prev, [fieldId]: val }))}
                  />
                )}

                {field.type === "date" && (
                  <ThemedDate
                    label={field.label || `Field ${idx + 1}`}
                    required={field.required}
                    themeName={themeName}
                    value={mockValues[fieldId] || ""}
                    onChange={(e) =>
                      setMockValues((prev) => ({ ...prev, [fieldId]: e.target.value }))
                    }
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <Compass
              className={cn(
                "w-12 h-12 opacity-50 animate-bounce transition-colors",
                isBatman ? "text-[#F5B921]" : isStark ? "text-[#00f0ff]" : "text-wano-gold",
              )}
            />
            <p
              className={cn(
                "text-sm font-bold",
                isBatman
                  ? "font-sans text-zinc-100 tracking-wider"
                  : isStark
                    ? "font-mono text-cyan-100"
                    : "font-heading text-wano-cream",
              )}
            >
              Chart is blank
            </p>
            <p
              className={cn(
                "text-xs max-w-xs leading-relaxed",
                isBatman
                  ? "text-zinc-500 font-sans"
                  : isStark
                    ? "text-cyan-200/50 font-mono"
                    : "text-wano-cream/60",
              )}
            >
              Add fields in the editor panel to visualize this survey island in real time.
            </p>
          </div>
        )}
      </div>

      {/* Mock Submit Action button */}
      <div
        className={cn(
          "pt-6 border-t mt-auto flex items-center justify-between transition-colors",
          isBatman ? "border-zinc-800" : isStark ? "border-[#00f0ff]/20" : "border-wano-gold/30",
        )}
      >
        <span
          className={cn(
            "text-[10px] font-mono",
            isBatman
              ? "text-zinc-500 font-sans"
              : isStark
                ? "text-cyan-200/30"
                : "text-wano-cream/40",
          )}
        >
          Form Preview Mode
        </span>
        <Button
          className={cn(
            "font-bold px-6 py-2.5 rounded-xl text-xs transition-all",
            isBatman
              ? "bg-[#F5B921] hover:bg-[#F5B921]/90 hover:shadow-[0_0_15px_rgba(245,185,33,0.4)] text-[#0B0C10] font-sans font-bold"
              : isStark
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] text-[#070b13] border border-cyan-300/40"
                : "btn-crimson hover:shadow-[0_0_20px_rgba(196,30,58,0.3)] text-wano-cream font-heading",
          )}
          disabled
        >
          {submitButtonText}
        </Button>
      </div>
    </div>
  );
}
