"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Anchor,
  BarChart3,
  Calendar,
  Eye,
  MoreVertical,
  PenTool,
  Settings,
  Trash2,
  Lock,
  Copy,
  Archive,
  RotateCcw,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { trpc } from "~/trpc/client";

interface FormCardProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    status: "draft" | "published" | "unpublished";
    expiresAt: string | null;
    passwordHash: string | null;
    isArchived: boolean;
  };
  responseCount?: number;
}

export function FormCard({ form, responseCount = 0 }: FormCardProps) {
  const utils = trpc.useUtils();

  const cloneMutation = trpc.form.cloneForm.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Island cloned successfully!");
      utils.form.getUserForms.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to clone form.");
    },
  });

  const updateStatusMutation = trpc.form.updateForm.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Island sails adjusted successfully!");
      utils.form.getUserForms.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update island status.");
    },
  });

  const archiveMutation = trpc.form.archiveForm.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Form archived successfully.");
      utils.form.getUserForms.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to archive form.");
    },
  });

  const unarchiveMutation = trpc.form.unarchiveForm.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Form restored successfully.");
      utils.form.getUserForms.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to restore form.");
    },
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statusLabels = {
    draft: { text: "Draft", class: "badge-draft" },
    published: { text: "Published", class: "badge-published" },
    unpublished: { text: "Closed", class: "badge-unpublished" },
  };

  const formattedDate =
    form.expiresAt && mounted
      ? new Date(form.expiresAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  return (
    <div className="relative rounded-2xl bg-ocean-mid/70 border border-ocean-surface/60 overflow-hidden card-hover-lift group flex flex-col justify-between min-h-[190px] shadow-md">
      {/* Header Accent block */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-wano-crimson via-wano-gold to-fruit-purple" />

      {/* Main card body */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
        {/* Top Info section */}
        <div>
          <div className="flex items-start justify-between gap-4">
            {/* Title with Noto Serif JP */}
            <h3 className="font-heading text-lg font-bold text-wano-cream leading-snug tracking-wide group-hover:text-wano-gold transition-colors line-clamp-1">
              {form.title}
            </h3>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-lg text-wano-cream/40 hover:text-wano-cream hover:bg-ocean-surface/50 shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="glass-panel border-ocean-surface text-wano-cream min-w-[160px]"
              >
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/forms/${form.id}/edit`}
                    className="flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <PenTool className="w-4 h-4 text-wano-gold" />
                    Edit Island (Fields)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/forms/${form.id}/settings`}
                    className="flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-wano-sakura" />
                    Ship Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/forms/${form.id}/responses`}
                    className="flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <Anchor className="w-4 h-4 text-fruit-glow" />
                    Treasures (Responses)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/forms/${form.id}/analytics`}
                    className="flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-gradient-crimson" />
                    Log Pose (Analytics)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-ocean-surface/50" />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/f/${form.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-wano-cream/70" />
                    Visit Island
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-ocean-surface/50" />
                <DropdownMenuItem
                  onClick={() => cloneMutation.mutate({ id: form.id })}
                  className="flex items-center gap-2 text-xs cursor-pointer text-wano-cream hover:bg-ocean-surface/50"
                  disabled={cloneMutation.isPending}
                >
                  <Copy className="w-4 h-4 text-wano-gold" />
                  Clone Island
                </DropdownMenuItem>
                {!form.isArchived && (
                  <>
                    <DropdownMenuSeparator className="bg-ocean-surface/50" />
                    {form.status === "published" ? (
                      <DropdownMenuItem
                        onClick={() =>
                          updateStatusMutation.mutate({ id: form.id, status: "unpublished" })
                        }
                        className="flex items-center gap-2 text-xs cursor-pointer text-wano-sakura hover:bg-ocean-surface/50 font-bold"
                        disabled={updateStatusMutation.isPending}
                      >
                        <Anchor className="w-4 h-4 text-wano-sakura" />
                        Unpublish (Anchor Ship)
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() =>
                          updateStatusMutation.mutate({ id: form.id, status: "published" })
                        }
                        className="flex items-center gap-2 text-xs cursor-pointer text-fruit-glow hover:bg-ocean-surface/50 font-bold"
                        disabled={updateStatusMutation.isPending}
                      >
                        <Compass className="w-4 h-4 text-fruit-glow" />
                        Publish (Set Sail)
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator className="bg-ocean-surface/50" />
                {form.isArchived ? (
                  <DropdownMenuItem
                    onClick={() => unarchiveMutation.mutate({ id: form.id })}
                    className="flex items-center gap-2 text-xs cursor-pointer text-emerald-400 hover:bg-ocean-surface/50 font-bold"
                    disabled={unarchiveMutation.isPending}
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    Restore Island
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => archiveMutation.mutate({ id: form.id })}
                    className="flex items-center gap-2 text-xs cursor-pointer text-rose-400 hover:bg-ocean-surface/50 font-bold"
                    disabled={archiveMutation.isPending}
                  >
                    <Archive className="w-4 h-4 text-rose-400" />
                    Archive Island
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <p className="text-xs text-wano-cream/50 mt-1.5 line-clamp-2 leading-relaxed">
            {form.description || "No descriptive entries documented for this island yet."}
          </p>
        </div>

        {/* Status indicator pill & password */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider font-heading",
                statusLabels[form.status]?.class,
              )}
            >
              {statusLabels[form.status]?.text}
            </span>

            {form.status === "published" && (
              <Link
                href={`/f/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-fruit-glow/10 border border-fruit-glow/20 text-fruit-glow hover:bg-fruit-glow/25 hover:border-fruit-glow/40 transition-all hover:scale-105 font-heading font-bold uppercase select-none shadow-[0_0_8px_rgba(78,205,196,0.1)]"
              >
                <Compass className="w-3 h-3 animate-spin-slow" />
                Visit
              </Link>
            )}

            {form.passwordHash && (
              <span className="flex items-center gap-1 text-[10px] text-wano-gold/80 px-1.5 py-0.5 rounded bg-wano-gold/5 border border-wano-gold/20 font-heading">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-wano-cream/40">
            <Anchor className="w-3.5 h-3.5 text-wano-gold" />
            <span className="font-semibold text-wano-cream/80">{responseCount}</span>
            <span>treasures</span>
          </div>
        </div>
      </div>

      {/* Footer info bar */}
      {formattedDate && (
        <div className="px-6 py-2 bg-ocean-deep/50 border-t border-ocean-surface/20 flex items-center gap-1.5 text-[10px] text-wano-cream/40 font-mono">
          <Calendar className="w-3 h-3" />
          <span>Sinks on: {formattedDate}</span>
        </div>
      )}
    </div>
  );
}
