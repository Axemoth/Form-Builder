"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Anchor, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

interface CreateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultThemeName?: string;
}

export function CreateFormDialog({ open, onOpenChange, defaultThemeName }: CreateFormDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Call the real tRPC form.createForm procedure!
  const createForm = trpc.form.createForm.useMutation({
    onSuccess: (data) => {
      toast.success("Island charted successfully! Setting sail...");
      onOpenChange(false);
      setTitle("");
      setDescription("");
      // Navigate to the edit view of the newly created form
      router.push(`/dashboard/forms/${data.id}/edit`);
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Failed to chart the island.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("The island needs a name!");
      return;
    }

    createForm.mutate({
      title,
      description: description || undefined,
      themeName: defaultThemeName || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-wano-gold/20 text-wano-cream max-w-md p-6 overflow-hidden">
        {/* Swirl backlight detail */}
        <div className="absolute -top-12 -left-12 w-28 h-28 fruit-swirl-subtle rounded-full opacity-10 blur-xl" />

        <DialogHeader className="mb-4">
          <DialogTitle className="font-heading text-2xl text-gradient-gold flex items-center gap-2">
            <Anchor className="w-5 h-5 text-wano-gold" />
            Chart a New Island
          </DialogTitle>
          <DialogDescription className="text-wano-cream/50 text-xs">
            Mark an uncharted location on your Grand Line map. Define a title and purpose for your
            form.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-xs font-semibold uppercase tracking-wider text-wano-cream/70 font-heading"
            >
              Island Name (Form Title) <span className="text-wano-crimson">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Straw Hat Recruitment Poll"
              className="bg-ocean-deep/60 border-ocean-surface text-wano-cream focus:border-wano-gold/40 focus:ring-0 rounded-xl"
              disabled={createForm.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-xs font-semibold uppercase tracking-wider text-wano-cream/70 font-heading"
            >
              Log Entry (Description)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the objective of this excursion..."
              className="bg-ocean-deep/60 border-ocean-surface text-wano-cream focus:border-wano-gold/40 focus:ring-0 rounded-xl resize-none h-24 axe-scrollbar"
              disabled={createForm.isPending}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-wano-cream/60 hover:text-wano-cream hover:bg-ocean-surface/50 rounded-xl"
              disabled={createForm.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-crimson rounded-xl px-5 py-2.5 font-bold flex items-center gap-2"
              disabled={createForm.isPending}
            >
              {createForm.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Charting...
                </>
              ) : (
                <>
                  <Anchor className="w-4 h-4" />
                  Chart Island
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
