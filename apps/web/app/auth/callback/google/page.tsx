"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { CompassLoader } from "~/components/ui/compass-loader";
import { CherryBlossoms } from "~/components/ui/cherry-blossoms";
import { InkBrushDivider } from "~/components/ui/ink-brush-divider";
import { toast } from "sonner";

function GoogleCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("Consulting the Log Pose...");
  const verifyTriggered = useRef(false);

  const googleLoginMutation = trpc.auth.loginWithGoogleCode.useMutation({
    onSuccess: (data) => {
      setStatusMessage("Charting course to your Ship Cabin...");

      // Save credentials in client storage
      localStorage.setItem("axeform_auth_token", data.token);
      localStorage.setItem("axeform_user_name", data.user.name);
      localStorage.setItem("axeform_user_email", data.user.email);
      localStorage.setItem("axeform_user_avatar", data.user.avatar || "⚓");
      localStorage.setItem("axeform_user_role", data.user.role);

      toast.success(`Welcome aboard, ${data.user.name}! Successful Google Sign-In.`);

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    },
    onError: (err) => {
      console.error("Google Auth Error:", err);
      toast.error("Identity authentication failed! Return to Port of Login.");
      router.push("/login");
    },
  });

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      toast.error("Identity token missing! Steering back to login port.");
      router.push("/login");
      return;
    }

    if (verifyTriggered.current) return;
    verifyTriggered.current = true;

    setStatusMessage("Exchanging credentials with Google identity guilds...");
    googleLoginMutation.mutate({ code });
  }, [searchParams, googleLoginMutation, router]);

  // Loading quotes / navigation steps to entertain during validation
  useEffect(() => {
    const messages = [
      "Consulting the Log Pose...",
      "Exchanging credentials with Google identity guilds...",
      "Steering past the Sea Kings...",
      "Syncing identity with the AxeForm logs...",
      "Summoning the captain's registry...",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (googleLoginMutation.isPending && idx < messages.length - 1) {
        idx++;
        const nextMessage = messages[idx];
        if (nextMessage) {
          setStatusMessage(nextMessage);
        }
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [googleLoginMutation.isPending]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ocean-deep text-wano-cream relative overflow-hidden px-4 select-none">
      <CherryBlossoms intensity="normal" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,30,58,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-md bg-ocean-mid/45 border-2 border-ocean-surface/60 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-md text-center space-y-6">
        {/* Hand drawn golden corners */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-wano-gold/40 rounded-tl-2xl pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-wano-gold/40 rounded-tr-2xl pointer-events-none" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-wano-gold/40 rounded-bl-2xl pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-wano-gold/40 rounded-br-2xl pointer-events-none" />

        <div className="flex justify-center py-4">
          <CompassLoader size="lg" />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-xl font-bold tracking-wide text-wano-cream">
            Verifying Google Identity
          </h2>
          <p className="text-[10px] font-mono text-wano-gold uppercase tracking-widest animate-pulse h-4">
            {statusMessage}
          </p>
        </div>

        <InkBrushDivider className="w-32 mx-auto" />

        <p className="text-[10px] text-wano-cream/30 font-mono">SECURED BY KAIROSEKI GATEWAYS</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-ocean-deep text-wano-cream relative overflow-hidden px-4">
          <CompassLoader size="lg" />
        </div>
      }
    >
      <GoogleCallbackHandler />
    </Suspense>
  );
}
