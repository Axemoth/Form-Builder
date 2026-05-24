"use client";

import { useState } from "react";
import { Lock, Loader2, ShieldAlert } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";

interface PasswordGateProps {
  slug: string;
  onUnlocked: (password: string) => void;
}

export function PasswordGate({ slug, onUnlocked }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [isLockedShake, setIsLockedShake] = useState(false);

  // tRPC Mutation to verify the password lock
  const verifyMutation = trpc.form.verifyFormPassword.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Passcode cannot be blank!");
      return;
    }

    try {
      const result = await verifyMutation.mutateAsync({
        slug,
        password,
      });

      if (result.success) {
        toast.success("Haki barrier shattered! Access granted.");
        onUnlocked(password);
      } else {
        // Trigger shake animation
        setIsLockedShake(true);
        toast.error("Passcode rejected! The Conqueror's Haki barrier holds firm.");
        setTimeout(() => setIsLockedShake(false), 6000);
      }
    } catch (err: any) {
      console.error(err);
      setIsLockedShake(true);
      toast.error(err.message || "An error occurred trying to break the lock.");
      setTimeout(() => setIsLockedShake(false), 6000);
    }
  };

  const isPending = verifyMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-ocean-deep relative overflow-hidden">
      {/* Immersive flowing red-glow dark energy background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,30,58,0.12)_0%,transparent_70%)] animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-fruit-purple/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Decorative Wano style storm/lightning SVG borders */}
      <div className="absolute top-0 inset-x-0 h-40 bg-[linear-gradient(to_bottom,rgba(10,22,40,1),rgba(10,22,40,0))] opacity-80 pointer-events-none" />

      <div
        className={`w-full max-w-md bg-ocean-mid/40 border-2 border-ocean-surface/60 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-md ${isLockedShake ? "animate-shake" : ""}`}
      >
        {/* Decorative corner swirl nodes */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-wano-gold/40 rounded-tl-2xl" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-wano-gold/40 rounded-tr-2xl" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-wano-gold/40 rounded-bl-2xl" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-wano-gold/40 rounded-br-2xl" />

        <div className="text-center space-y-6">
          {/* Padlock circular emblem */}
          <div className="mx-auto w-20 h-20 bg-wano-crimson/10 border-2 border-wano-crimson/30 rounded-full flex items-center justify-center relative group">
            {/* Pulsing red Haki rings */}
            <span className="absolute inset-0 rounded-full border-2 border-wano-crimson/20 animate-ping opacity-75" />
            <Lock className="w-9 h-9 text-wano-crimson stroke-[2px] relative z-10 transition-transform group-hover:scale-110" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold text-wano-cream tracking-wide">
              Conqueror's Haki Lock
            </h2>
            <p className="text-xs text-wano-cream/50 max-w-sm mx-auto leading-relaxed">
              This island is protected by an energy barrier. Enter the secret pirate coordinates to
              unlock this parchment survey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wano-gold/80 font-heading">
                Coordinate Passphrase
              </label>
              <Input
                type="password"
                required
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passphrase..."
                className="bg-ocean-deep/60 border-2 border-ocean-surface text-wano-gold text-xs h-11 px-4 focus-visible:ring-0 focus:border-wano-gold/60 rounded-xl font-mono text-center placeholder:text-wano-cream/20 tracking-widest"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-wano-crimson hover:bg-wano-crimson-light text-wano-cream font-bold text-xs h-11 rounded-xl shadow-lg shadow-wano-crimson/20 border-2 border-wano-crimson hover:shadow-[0_0_15px_rgba(196,30,58,0.4)] flex items-center justify-center gap-2 font-heading tracking-wider uppercase active:scale-95 transition-all mt-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-wano-cream" />
                  Breaking Barrier...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-wano-gold animate-bounce" />
                  Break Haki Shield ⚡
                </>
              )}
            </Button>
          </form>

          <div className="pt-2">
            <span className="text-[9px] text-wano-cream/30 font-mono">
              SECURE CARGO PROTOCOL V2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
