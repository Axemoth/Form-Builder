"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Anchor, CheckCircle2, XCircle, Loader2, Sparkles, Compass } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const verifyMutation = trpc.auth.verifyEmail.useMutation();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token was found in the URL. Please verify your link.");
      return;
    }

    let active = true;

    async function triggerVerification() {
      try {
        const result = await verifyMutation.mutateAsync({ token: token as string });
        if (active) {
          if (result.success) {
            setStatus("success");
            toast.success("Email verified successfully! Setting sail...");
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
          } else {
            setStatus("error");
            setErrorMessage(result.message || "Failed to verify email address.");
          }
        }
      } catch (err: any) {
        if (active) {
          setStatus("error");
          setErrorMessage(err.message || "Invalid or expired verification token.");
        }
      }
    }

    triggerVerification();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-[#060b13] flex items-center justify-center p-6 text-wano-cream font-sans relative overflow-hidden">
      {/* Decorative Wano Crimson & Gold Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-wano-crimson/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wano-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#101c30]/75 border border-wano-gold/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 relative overflow-hidden text-center space-y-6 animate-scale-in">
        {/* Wano border accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-wano-crimson via-wano-gold to-wano-crimson" />

        {status === "loading" && (
          <div className="py-12 space-y-6 flex flex-col items-center">
            <div className="relative flex items-center justify-center w-24 h-24">
              <div className="absolute inset-0 bg-wano-gold/10 rounded-full blur-xl animate-pulse" />
              <Loader2 className="w-16 h-16 text-wano-gold animate-spin stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-heading text-wano-gold flex items-center justify-center gap-2 tracking-wide">
                <Anchor className="w-5 h-5 animate-pulse" />
                Reading Log Coordinates...
              </h2>
              <p className="text-xs text-wano-cream/60 max-w-xs mx-auto leading-relaxed">
                Calculating coordinates against sea maps. Please hold standard navigation...
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="py-10 space-y-6 flex flex-col items-center animate-scale-in">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-fruit-glow/10 rounded-full blur-xl animate-pulse pointer-events-none" />
              <div className="absolute -inset-2 bg-gradient-to-tr from-wano-crimson to-wano-gold rounded-full opacity-10 animate-spin" style={{ animationDuration: "8s" }} />
              <div className="relative z-10 animate-bounce" style={{ animationDuration: "3s" }}>
                <CheckCircle2 className="w-16 h-16 text-fruit-glow stroke-[1.5]" />
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-wano-gold animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading text-wano-cream tracking-wide">
                Coordinates Verified!
              </h2>
              <p className="text-sm text-wano-cream/70 max-w-xs mx-auto leading-relaxed font-sans">
                Your email has been successfully verified. Prepare your ship, we are redirecting you to your main cabin coordinates...
              </p>
            </div>
            <div className="pt-2 animate-pulse">
              <Button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 mx-auto rounded-xl btn-crimson text-xs tracking-wider font-bold"
              >
                <Compass className="w-4 h-4 text-wano-gold" />
                Enter Dashboard
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-10 space-y-6 flex flex-col items-center animate-scale-in">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-wano-crimson/15 rounded-full blur-xl pointer-events-none" />
              <XCircle className="w-16 h-16 text-wano-crimson stroke-[1.5] animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-heading text-wano-crimson tracking-wide">
                Navigation Damage!
              </h2>
              <p className="text-sm text-wano-cream/70 max-w-xs mx-auto leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button
                onClick={() => router.push("/dashboard")}
                className="rounded-xl px-6 py-2 border border-wano-gold/30 bg-[#162235] hover:bg-[#202f47] text-wano-gold hover:text-white text-xs font-bold font-heading transition"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-ocean-surface/20">
          <p className="text-[10px] uppercase tracking-widest text-wano-cream/30 font-mono">
            AxeForm Secure Auth System // Wano Division
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#060b13] flex items-center justify-center p-6 text-wano-cream font-sans">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-wano-gold animate-spin mx-auto" />
          <p className="text-sm text-wano-cream/60">Loading Navigation HUD...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
