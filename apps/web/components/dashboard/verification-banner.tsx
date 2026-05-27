"use client";

import { useState } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { ShieldAlert, Send, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "~/components/ui/button";

export function VerificationBanner() {
  const { data: userProfile, refetch } = trpc.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  const resendMutation = trpc.auth.resendVerificationEmail.useMutation();
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      const result = await resendMutation.mutateAsync(undefined);
      if (result.success) {
        toast.success("Verification News Coo bird dispatched! Check your sandbox inbox.");
        setCooldown(60);
        
        // Cooldown timer countdown
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch verification log bird.");
    }
  };

  // If loading or already verified, do not render the banner
  if (!userProfile || userProfile.emailVerified) {
    return null;
  }

  const isPending = resendMutation.isPending;

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-r from-wano-crimson/15 via-[#1a1118]/60 to-[#101c30]/80 border-l-4 border-wano-crimson border-y border-r border-wano-gold/10 backdrop-blur-md p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl overflow-hidden animate-pulse-slow">
      {/* Golden corners decor */}
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-wano-gold/20 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-wano-gold/20 rounded-br-xl pointer-events-none" />

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-wano-crimson/15 border border-wano-crimson/35 flex items-center justify-center text-wano-crimson shrink-0">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1 text-left">
          <h4 className="font-heading text-sm font-bold text-wano-cream tracking-wide flex items-center gap-1.5">
            Navigator Logs Unverified!
            <Sparkles className="w-3.5 h-3.5 text-wano-gold animate-pulse" />
          </h4>
          <p className="text-xs text-wano-cream/65 leading-relaxed max-w-xl">
            Your pirate coordinates are not verified yet. To unlock complete platform navigation rights (such as publishing surveys and downloading visual response statistics), please confirm the link dispatched to <strong className="text-wano-gold">{userProfile.email}</strong>.
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <Button
          onClick={handleResend}
          disabled={isPending || cooldown > 0}
          className="rounded-xl px-4 py-2 bg-[#1a0e14] hover:bg-wano-crimson/25 border border-wano-crimson/40 text-wano-crimson hover:text-white text-xs font-bold font-heading flex items-center gap-2 transition"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Flying...
            </>
          ) : cooldown > 0 ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-wano-gold" />
              Coo Bird Cooldown ({cooldown}s)
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Resend verification log bird
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
