"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import {
  Compass,
  Hammer,
  Settings,
  Trophy,
  BarChart3,
  ChevronLeft,
  Share2,
  ExternalLink,
  Anchor,
  Info,
  X,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface FormWorkspaceHeaderProps {
  formId: string;
  title: string;
  status: string;
  slug: string;
  activeTab: "builder" | "settings" | "responses" | "analytics";
  onSave?: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
}

export function FormWorkspaceHeader({
  formId,
  title,
  status,
  slug,
  activeTab,
  onSave,
  isSaving,
  isDirty,
}: FormWorkspaceHeaderProps) {
  const pathname = usePathname();
  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.form.updateForm.useMutation();

  // Floating Guide and Prompt States
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showGuidePrompt, setShowGuidePrompt] = useState(false);

  useEffect(() => {
    // Show a gentle prompt bubble after 2.5 seconds if the guide hasn't been opened/dismissed
    const promptDismissed = localStorage.getItem("wano_navigator_prompt_dismissed");
    if (!promptDismissed) {
      const timer = setTimeout(() => {
        setShowGuidePrompt(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const tabs = [
    {
      id: "builder",
      label: "Devil Fruit Workshop",
      href: `/dashboard/forms/${formId}/edit`,
      icon: Hammer,
    },
    {
      id: "settings",
      label: "Ship Settings",
      href: `/dashboard/forms/${formId}/settings`,
      icon: Settings,
    },
    {
      id: "responses",
      label: "Treasures Collected",
      href: `/dashboard/forms/${formId}/responses`,
      icon: Trophy,
    },
    {
      id: "analytics",
      label: "Sea Charts (Analytics)",
      href: `/dashboard/forms/${formId}/analytics`,
      icon: BarChart3,
    },
  ];

  const handleShare = () => {
    const publicUrl = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Grand Line map link copied to clipboard!");
  };

  return (
    <>
      <div className="space-y-4 border-b border-ocean-surface/30 pb-4">
        {/* Top row: Back arrow & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-ocean-mid hover:bg-ocean-surface/80 text-wano-cream/60 hover:text-wano-cream transition-all border border-ocean-surface/30 flex items-center justify-center shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading text-2xl font-bold text-wano-cream leading-tight truncate max-w-md sm:max-w-xl">
                  {title || "Loading Chart..."}
                </h1>
                <Select
                  value={status}
                  onValueChange={async (newStatus) => {
                    try {
                      await updateStatusMutation.mutateAsync({
                        id: formId,
                        status: newStatus as any,
                      });
                      toast.success(`Island sails adjusted! Form is now ${newStatus}.`);
                      utils.form.getFormById.invalidate({ id: formId });
                    } catch (err: any) {
                      toast.error(err.message || "Failed to update status.");
                    }
                  }}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="bg-transparent border-none p-0 h-auto focus:ring-0 focus:ring-offset-0 w-auto hover:opacity-90 select-none">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono border cursor-pointer flex items-center gap-1 hover:brightness-125 transition-all shadow-[0_0_8px_rgba(0,0,0,0.2)]",
                        status === "published"
                          ? "bg-fruit-glow/10 border-fruit-glow/20 text-fruit-glow shadow-[0_0_12px_rgba(78,205,196,0.15)]"
                          : status === "draft"
                            ? "bg-wano-cream/10 border-wano-cream/20 text-wano-cream/60"
                            : "bg-wano-crimson/10 border-wano-crimson/20 text-wano-crimson shadow-[0_0_12px_rgba(196,30,58,0.15)]",
                      )}
                    >
                      {status}
                      <span className="text-[7px] opacity-75">▼</span>
                    </span>
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-ocean-surface text-wano-cream min-w-[150px] shadow-2xl">
                    <SelectItem value="draft" className="text-xs hover:bg-ocean-surface/60 cursor-pointer">
                      Draft (Parchment Locked)
                    </SelectItem>
                    <SelectItem value="published" className="text-xs hover:bg-ocean-surface/60 cursor-pointer">
                      Published (Setting Sail)
                    </SelectItem>
                    <SelectItem value="unpublished" className="text-xs hover:bg-ocean-surface/60 cursor-pointer">
                      Unpublished (Anchored)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[10px] text-wano-cream/40 font-mono flex items-center gap-1 mt-0.5">
                <Compass className="w-3 h-3 animate-spin-slow text-wano-gold" />
                Route ID: {formId.substring(0, 8)}... | Slug: {slug}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeTab === "builder" && onSave && (
              <Button
                onClick={onSave}
                disabled={isSaving || !isDirty}
                className={cn(
                  "rounded-xl text-xs px-4 py-2.5 font-bold transition-all shadow-md",
                  isDirty
                    ? "btn-crimson hover:shadow-[0_0_15px_rgba(196,30,58,0.4)]"
                    : "bg-ocean-mid border border-ocean-surface text-wano-cream/40 cursor-not-allowed",
                )}
              >
                {isSaving ? "Saving Course..." : isDirty ? "Save Course ⚓" : "Course Saved"}
              </Button>
            )}

            <Button
              onClick={handleShare}
              className="bg-ocean-mid border border-ocean-surface hover:bg-ocean-surface/80 text-wano-cream/80 hover:text-wano-cream rounded-xl text-xs px-4 py-2.5 font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Link
            </Button>

            <Link href={`/f/${slug}`} target="_blank" rel="noopener noreferrer">
              <Button className="btn-gold-outline text-xs px-4 py-2.5 font-bold flex items-center gap-2 rounded-xl transition-all shadow-md">
                <ExternalLink className="w-3.5 h-3.5" />
                Visit Island
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs navigation row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 axe-scrollbar pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <Link key={tab.id} href={tab.href} className="shrink-0">
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-heading transition-all border border-transparent select-none cursor-pointer",
                    isActive
                      ? "bg-wano-gold/10 border-wano-gold/25 text-wano-gold font-bold shadow-[0_0_15px_rgba(201,168,76,0.08)]"
                      : "text-wano-cream/60 hover:text-wano-cream hover:bg-ocean-mid/40",
                  )}
                >
                  <Icon
                    className={cn("w-4 h-4", isActive ? "text-wano-gold" : "text-wano-cream/45")}
                  />
                  {tab.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Premium Warning Alert Banner for Draft Status */}
        {status === "draft" && (
          <div className="mt-2 bg-gradient-to-r from-wano-gold/10 via-ocean-mid/40 to-ocean-mid/20 border border-wano-gold/25 rounded-xl p-4 shadow-[0_4px_25px_rgba(201,168,76,0.04)] relative overflow-hidden animate-fadeIn">
            {/* Left Gold Accent Highlight Line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-wano-gold to-transparent" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-wano-gold/10 border border-wano-gold/20 text-wano-gold shrink-0 mt-0.5 sm:mt-0">
                  <Anchor className="w-4 h-4 animate-bounce-slow" />
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold text-wano-cream flex items-center gap-1.5">
                    ⚓ Set Sail Notice: Island is Anchored (Draft Mode)
                  </h4>
                  <p className="text-[11px] text-wano-cream/60 leading-relaxed mt-1">
                    Your island coordinates are currently hidden in the sea fog of the Grand Line.
                    respondents visiting your public link will encounter an{" "}
                    <span className="text-wano-crimson font-semibold font-mono">
                      Island Lost in Fog
                    </span>{" "}
                    error until you chart your sails.
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-auto">
                {activeTab !== "settings" ? (
                  <Link href={`/dashboard/forms/${formId}/settings`}>
                    <Button className="bg-wano-gold hover:bg-wano-gold-light text-ocean-deep text-[10px] px-3.5 py-1.5 h-auto font-bold rounded-lg flex items-center gap-1.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(201,168,76,0.35)] border border-transparent">
                      <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                      Log Coordinates to Sail (Publish)
                    </Button>
                  </Link>
                ) : (
                  <div className="text-[10px] text-wano-gold/90 font-mono font-semibold flex items-center gap-1.5 bg-wano-gold/10 border border-wano-gold/20 px-3 py-1.5 rounded-lg">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    Select &apos;Published&apos; in Logistics below!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Premium Info Alert Banner for Published Status */}
        {status === "published" && (
          <div className="mt-2 bg-gradient-to-r from-fruit-glow/10 via-ocean-mid/40 to-ocean-mid/20 border border-fruit-glow/25 rounded-xl p-4 shadow-[0_4px_25px_rgba(78,205,196,0.04)] relative overflow-hidden animate-fadeIn">
            {/* Left Gold Accent Highlight Line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fruit-glow to-transparent" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-fruit-glow/10 border border-fruit-glow/20 text-fruit-glow shrink-0 mt-0.5 sm:mt-0">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold text-wano-cream flex items-center gap-1.5">
                    🌊 Voyage Active: Island is Live (Published Mode)
                  </h4>
                  <p className="text-[11px] text-wano-cream/60 leading-relaxed mt-1">
                    Your form is actively taking submissions! You can unpublish it at any time to halt new submissions by selecting <span className="text-wano-crimson font-semibold">Unpublished</span> in the header badge dropdown.
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-auto">
                <Button 
                  onClick={handleShare}
                  className="bg-fruit-glow/10 hover:bg-fruit-glow/20 border border-fruit-glow/30 text-fruit-glow text-[10px] px-3.5 py-1.5 h-auto font-bold rounded-lg flex items-center gap-1.5 transition-all duration-300"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share Live Link
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Premium Danger Alert Banner for Unpublished Status */}
        {status === "unpublished" && (
          <div className="mt-2 bg-gradient-to-r from-wano-crimson/10 via-ocean-mid/40 to-ocean-mid/20 border border-wano-crimson/25 rounded-xl p-4 shadow-[0_4px_25px_rgba(196,30,58,0.04)] relative overflow-hidden animate-fadeIn">
            {/* Left Gold Accent Highlight Line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-wano-crimson to-transparent" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-wano-crimson/10 border border-wano-crimson/20 text-wano-crimson shrink-0 mt-0.5 sm:mt-0">
                  <Anchor className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold text-wano-cream flex items-center gap-1.5">
                    ⚓ Island is Anchored (Unpublished Mode)
                  </h4>
                  <p className="text-[11px] text-wano-cream/60 leading-relaxed mt-1">
                    This form is closed to submissions. Existing responses are safely kept. You can republish it at any time by changing the status to <span className="text-fruit-glow font-semibold">Published</span>.
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-auto">
                <Button 
                  onClick={async () => {
                    try {
                      await updateStatusMutation.mutateAsync({
                        id: formId,
                        status: "published",
                      });
                      toast.success("Island sails adjusted! Form is now published.");
                      utils.form.getFormById.invalidate({ id: formId });
                    } catch (err: any) {
                      toast.error(err.message || "Failed to update status.");
                    }
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="bg-wano-sakura/10 hover:bg-wano-sakura/20 border border-wano-sakura/30 text-wano-sakura text-[10px] px-3.5 py-1.5 h-auto font-bold rounded-lg flex items-center gap-1.5 transition-all duration-300"
                >
                  <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                  Set Sail (Publish)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Navigator's Log Pose Guide Window */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        {/* Pulsating Prompt Bubble */}
        {showGuidePrompt && !isGuideOpen && (
          <div className="glass-panel border-wano-gold/25 bg-ocean-deep/95 text-wano-cream p-3 rounded-2xl max-w-xs shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative animate-fadeIn border pointer-events-auto select-none">
            <button
              onClick={() => {
                setShowGuidePrompt(false);
                localStorage.setItem("wano_navigator_prompt_dismissed", "true");
              }}
              className="absolute top-2.5 right-2.5 text-wano-cream/40 hover:text-wano-cream transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="pr-4">
              <span className="text-[10px] font-bold text-wano-gold font-mono uppercase tracking-wider block">
                🧭 Navigator&apos;s Advice
              </span>
              <p className="text-[10px] text-wano-cream/70 leading-relaxed mt-1">
                Forms start in <span className="text-wano-gold font-semibold">Draft Mode</span> so
                pirates can&apos;t inspect incomplete pathways. Tap below to learn how to set sail!
              </p>
            </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          onClick={() => {
            setIsGuideOpen(!isGuideOpen);
            setShowGuidePrompt(false);
            localStorage.setItem("wano_navigator_prompt_dismissed", "true");
          }}
          className={cn(
            "w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 shadow-[0_8px_25px_rgba(0,0,0,0.5)] pointer-events-auto cursor-pointer group",
            isGuideOpen
              ? "bg-wano-crimson border-wano-crimson/50 text-wano-cream hover:bg-wano-crimson-light"
              : "bg-ocean-mid border-wano-gold/30 hover:border-wano-gold text-wano-gold hover:text-wano-cream hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]",
          )}
        >
          {isGuideOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <div className="relative">
              <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
              <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wano-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-wano-gold"></span>
              </span>
            </div>
          )}
        </button>

        {/* Glassmorphic Guide Window */}
        {isGuideOpen && (
          <div className="glass-panel border-wano-gold/30 bg-ocean-deep/95 text-wano-cream w-[320px] sm:w-[350px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden border pointer-events-auto flex flex-col max-h-[460px] animate-scaleIn">
            {/* Header */}
            <div className="p-4 border-b border-ocean-surface/30 bg-ocean-mid/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-wano-gold" />
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-wano-cream">
                  Navigator&apos;s Voyage Guide
                </h3>
              </div>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="text-wano-cream/40 hover:text-wano-cream transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 space-y-4 overflow-y-auto axe-scrollbar text-xs leading-relaxed flex-1">
              {/* Status explanation */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] text-wano-gold font-mono uppercase tracking-wider">
                  🧭 Port & Voyage Statuses
                </h4>
                <div className="space-y-2">
                  <div className="bg-ocean-mid/40 p-2.5 rounded-xl border border-ocean-surface/20">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-wano-cream/40" />
                      <span className="font-bold text-wano-cream text-[10.5px]">
                        Draft (Parchment Locked)
                      </span>
                    </div>
                    <p className="text-[10px] text-wano-cream/60 mt-1 pl-3.5 leading-relaxed">
                      Newly created forms default here. Safe for building! Respondents see a fog
                      error.
                    </p>
                  </div>

                  <div className="bg-ocean-mid/40 p-2.5 rounded-xl border border-fruit-glow/20">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-fruit-glow animate-pulse" />
                      <span className="font-bold text-fruit-glow text-[10.5px]">
                        Published (Setting Sail)
                      </span>
                    </div>
                    <p className="text-[10px] text-wano-cream/60 mt-1 pl-3.5 leading-relaxed">
                      Gates are wide open! Public links are fully live and anyone can submit
                      answers.
                    </p>
                  </div>

                  <div className="bg-ocean-mid/40 p-2.5 rounded-xl border border-wano-crimson/20">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-wano-crimson" />
                      <span className="font-bold text-wano-crimson text-[10.5px]">
                        Unpublished (Anchored)
                      </span>
                    </div>
                    <p className="text-[10px] text-wano-cream/60 mt-1 pl-3.5 leading-relaxed">
                      Form is temporarily closed to submissions. Existing responses are safely kept.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="space-y-2 pt-2 border-t border-ocean-surface/20">
                <h4 className="font-bold text-[10px] text-wano-gold font-mono uppercase tracking-wider">
                  ⚡ Navigator Pro-Tips
                </h4>
                <ul className="space-y-1.5 text-[10px] text-wano-cream/70 list-disc pl-4">
                  <li>
                    <span className="text-wano-cream font-medium">Devil Fruits Tags:</span>{" "}
                    Dropdowns show modern labels (like{" "}
                    <span className="text-wano-gold">Email Address</span>) primarily, with One Piece
                    names as tags!
                  </li>
                  <li>
                    <span className="text-wano-cream font-medium">Bounty Maps:</span> Share your
                    custom slug or grab the iFrame Embed in Settings to host the page on your custom
                    website.
                  </li>
                  <li>
                    <span className="text-wano-cream font-medium">News Coo Birds:</span> Enable
                    email notifications under settings to receive instant response alerts.
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-ocean-surface/30 bg-ocean-mid/40 flex items-center justify-between text-[9px] text-wano-cream/40 font-mono">
              <span>Grand Line Voyage Log v1.2</span>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="text-wano-gold hover:underline transition-all cursor-pointer font-bold"
              >
                Clear Sailing! ⚓
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
