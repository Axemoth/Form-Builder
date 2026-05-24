"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { CherryBlossoms } from "~/components/ui/cherry-blossoms";
import { WaveBackground } from "~/components/ui/wave-background";
import { InkBrushDivider } from "~/components/ui/ink-brush-divider";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Anchor,
  Compass,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";

type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");

  // Sign In fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  const [isPending, setIsPending] = useState(false);

  // Query Google OAuth URL from backend router
  const { data: providers } = trpc.auth.getSupportedAuthenticationProviders.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Login mutation
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("axeform_auth_token", data.token);
      localStorage.setItem("axeform_user_name", data.user.name);
      localStorage.setItem("axeform_user_email", data.user.email);
      localStorage.setItem("axeform_user_avatar", data.user.avatar || "⚓");
      localStorage.setItem("axeform_user_role", data.user.role);
      toast.success(`Welcome back, ${data.user.name}! Setting sail...`);
      setTimeout(() => router.push("/dashboard"), 800);
    },
    onError: (err) => {
      setIsPending(false);
      toast.error(err.message || "Authentication failed. Check your credentials.");
    },
  });

  // Signup mutation
  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("axeform_auth_token", data.token);
      localStorage.setItem("axeform_user_name", data.user.name);
      localStorage.setItem("axeform_user_email", data.user.email);
      localStorage.setItem("axeform_user_avatar", data.user.avatar || "⚓");
      localStorage.setItem("axeform_user_role", data.user.role);
      toast.success(`Welcome aboard, ${data.user.name}! Your voyage begins now!`);
      setTimeout(() => router.push("/dashboard"), 800);
    },
    onError: (err) => {
      setIsPending(false);
      toast.error(err.message || "Sign up failed. Please try again.");
    },
  });

  // Google OAuth redirect
  const handleGoogleLogin = () => {
    const googleProvider = providers?.find((p) => p.provider === "GOOGLE_OAUTH");
    if (googleProvider?.authUrl) {
      setIsPending(true);
      toast.info("Steering ship to Google identity portal...");
      window.location.href = googleProvider.authUrl;
      return;
    }
    toast.error("Google sign-in is not configured. Contact your administrator.");
  };

  // Email/password sign in
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Email and password are required!");
      return;
    }
    setIsPending(true);
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  // Email/password sign up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast.error("All fields are required for recruitment!");
      return;
    }
    if (signupPassword.length < 6) {
      toast.error("Passcode must be at least 6 characters!");
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passcodes do not match! Verify and try again.");
      return;
    }
    setIsPending(true);
    signupMutation.mutate({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
    });
  };

  const switchMode = (newMode: AuthMode) => {
    if (isPending) return;
    setMode(newMode);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-ocean-deep text-wano-cream relative overflow-hidden py-10 px-4">
      {/* Visual backgrounds */}
      <CherryBlossoms intensity="normal" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,30,58,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-md mx-auto my-auto bg-ocean-mid/45 border-2 border-ocean-surface/60 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-md">
        {/* Hand drawn golden corners */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-wano-gold/40 rounded-tl-2xl pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-wano-gold/40 rounded-tr-2xl pointer-events-none" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-wano-gold/40 rounded-bl-2xl pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-wano-gold/40 rounded-br-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-wano-gold/10 border-2 border-wano-gold/30 rounded-full flex items-center justify-center relative group">
            <span className="absolute inset-0 rounded-full border border-wano-gold/20 animate-ping opacity-75" />
            <Compass className="w-8 h-8 text-wano-gold group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-wide text-wano-cream">
              {mode === "signin" ? "Enter The Grand Line" : "Join The Crew"}
            </h2>
            <p className="text-[10px] font-mono text-wano-cream/40 uppercase tracking-widest mt-1">
              AxeForm Navigator Gateway
            </p>
          </div>
          <InkBrushDivider className="w-32 mx-auto" />
        </div>

        {/* Tab Switcher */}
        <div className="flex mt-6 rounded-xl overflow-hidden border border-ocean-surface/60 bg-ocean-deep/40">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            disabled={isPending}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-heading font-bold uppercase tracking-wider transition-all duration-300 ${
              mode === "signin"
                ? "bg-wano-crimson/90 text-wano-cream shadow-lg shadow-wano-crimson/20"
                : "bg-transparent text-wano-cream/40 hover:text-wano-cream/60 hover:bg-ocean-surface/20"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            disabled={isPending}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-heading font-bold uppercase tracking-wider transition-all duration-300 ${
              mode === "signup"
                ? "bg-wano-crimson/90 text-wano-cream shadow-lg shadow-wano-crimson/20"
                : "bg-transparent text-wano-cream/40 hover:text-wano-cream/60 hover:bg-ocean-surface/20"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Sign Up
          </button>
        </div>

        {/* Sign In Form */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4 mt-6 animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wano-gold/80 font-heading">
                Navigator Identity (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wano-cream/35" />
                <Input
                  id="login-email"
                  type="email"
                  required
                  disabled={isPending}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="luffy@thousandsunny.com"
                  className="bg-ocean-deep/60 border-2 border-ocean-surface text-wano-cream pl-9 text-xs h-11 focus-visible:ring-0 focus:border-wano-gold/60 rounded-xl w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wano-gold/80 font-heading">
                Captain's Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wano-cream/35" />
                <Input
                  id="login-password"
                  type={showLoginPassword ? "text" : "password"}
                  required
                  disabled={isPending}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-ocean-deep/60 border-2 border-ocean-surface text-wano-cream pl-9 pr-10 text-xs h-11 focus-visible:ring-0 focus:border-wano-gold/60 rounded-xl w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wano-cream/35 hover:text-wano-cream/60 transition-colors"
                  tabIndex={-1}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              id="login-submit"
              type="submit"
              disabled={isPending}
              className="w-full bg-wano-crimson hover:bg-wano-crimson-light text-wano-cream font-bold text-xs h-11 rounded-xl shadow-lg border-2 border-wano-crimson hover:shadow-[0_0_15px_rgba(196,30,58,0.35)] flex items-center justify-center gap-2 font-heading tracking-wider uppercase active:scale-95 transition-all mt-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-wano-cream" />
                  Setting Sail...
                </>
              ) : (
                <>
                  <Anchor className="w-4 h-4 text-wano-gold" />
                  Sign In ⚓
                </>
              )}
            </Button>
          </form>
        )}

        {/* Sign Up Form */}
        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4 mt-6 animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wano-gold/80 font-heading">
                Pirate Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wano-cream/35" />
                <Input
                  id="signup-name"
                  type="text"
                  required
                  disabled={isPending}
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Monkey D. Luffy"
                  className="bg-ocean-deep/60 border-2 border-ocean-surface text-wano-cream pl-9 text-xs h-11 focus-visible:ring-0 focus:border-wano-gold/60 rounded-xl w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wano-gold/80 font-heading">
                Navigator Identity (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wano-cream/35" />
                <Input
                  id="signup-email"
                  type="email"
                  required
                  disabled={isPending}
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="newbie@grandline.com"
                  className="bg-ocean-deep/60 border-2 border-ocean-surface text-wano-cream pl-9 text-xs h-11 focus-visible:ring-0 focus:border-wano-gold/60 rounded-xl w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wano-gold/80 font-heading">
                Create Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wano-cream/35" />
                <Input
                  id="signup-password"
                  type={showSignupPassword ? "text" : "password"}
                  required
                  disabled={isPending}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="bg-ocean-deep/60 border-2 border-ocean-surface text-wano-cream pl-9 pr-10 text-xs h-11 focus-visible:ring-0 focus:border-wano-gold/60 rounded-xl w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wano-cream/35 hover:text-wano-cream/60 transition-colors"
                  tabIndex={-1}
                >
                  {showSignupPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* Password strength indicator */}
              {signupPassword.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        signupPassword.length >= level * 3
                          ? level <= 1
                            ? "bg-red-400"
                            : level <= 2
                              ? "bg-yellow-400"
                              : level <= 3
                                ? "bg-fruit-glow/70"
                                : "bg-fruit-glow"
                          : "bg-ocean-surface/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wano-gold/80 font-heading">
                Confirm Passcode
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wano-cream/35" />
                <Input
                  id="signup-confirm-password"
                  type={showSignupConfirm ? "text" : "password"}
                  required
                  disabled={isPending}
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Re-enter passcode"
                  className={`bg-ocean-deep/60 border-2 text-wano-cream pl-9 pr-10 text-xs h-11 focus-visible:ring-0 rounded-xl w-full ${
                    signupConfirmPassword.length > 0 && signupPassword !== signupConfirmPassword
                      ? "border-red-400/60 focus:border-red-400/80"
                      : signupConfirmPassword.length > 0 && signupPassword === signupConfirmPassword
                        ? "border-fruit-glow/50 focus:border-fruit-glow/70"
                        : "border-ocean-surface focus:border-wano-gold/60"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupConfirm(!showSignupConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wano-cream/35 hover:text-wano-cream/60 transition-colors"
                  tabIndex={-1}
                >
                  {showSignupConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {signupConfirmPassword.length > 0 && signupPassword !== signupConfirmPassword && (
                <p className="text-[10px] text-red-400/80 font-mono mt-0.5">
                  Passcodes don&apos;t match
                </p>
              )}
            </div>

            <Button
              id="signup-submit"
              type="submit"
              disabled={
                isPending ||
                (signupConfirmPassword.length > 0 && signupPassword !== signupConfirmPassword)
              }
              className="w-full bg-wano-crimson hover:bg-wano-crimson-light text-wano-cream font-bold text-xs h-11 rounded-xl shadow-lg border-2 border-wano-crimson hover:shadow-[0_0_15px_rgba(196,30,58,0.35)] flex items-center justify-center gap-2 font-heading tracking-wider uppercase active:scale-95 transition-all mt-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-wano-cream" />
                  Recruiting...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-wano-gold" />
                  Join The Crew ⚓
                </>
              )}
            </Button>
          </form>
        )}

        {/* Separator */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-x-0 h-[1px] bg-ocean-surface/60" />
          <span className="relative z-10 px-3 bg-ocean-mid text-[9px] font-mono uppercase text-wano-cream/30">
            or continue with pirate guilds
          </span>
        </div>

        {/* Google OAuth */}
        <div className="grid grid-cols-1">
          <Button
            id="google-login"
            onClick={handleGoogleLogin}
            disabled={isPending}
            className="w-full bg-ocean-deep hover:bg-ocean-surface/75 border border-ocean-surface text-wano-cream text-xs h-11 rounded-xl flex items-center justify-center gap-2 shadow-sm font-heading group transition-all hover:border-wano-gold/30"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="group-hover:text-wano-gold transition-colors">
              Continue with Google
            </span>
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-6 text-center">
          <span className="text-[9px] text-wano-cream/25 font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-fruit-glow" />
            SECURED BY KAIROSEKI GATEWAYS
          </span>
        </div>

        {/* Mode switch prompt */}
        <div className="pt-3 text-center">
          {mode === "signin" ? (
            <p className="text-[10px] text-wano-cream/40 font-mono">
              New to the Grand Line?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                disabled={isPending}
                className="text-wano-gold hover:text-wano-gold-light underline underline-offset-2 transition-colors font-bold"
              >
                Join the Crew
              </button>
            </p>
          ) : (
            <p className="text-[10px] text-wano-cream/40 font-mono">
              Already have a bounty poster?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                disabled={isPending}
                className="text-wano-gold hover:text-wano-gold-light underline underline-offset-2 transition-colors font-bold"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="text-center opacity-40 py-4 select-none z-10">
        <p className="text-[8px] font-mono uppercase tracking-widest text-wano-cream/50">
          AxeForm v1.0 • All Rights Reserved
        </p>
      </div>

      <WaveBackground position="bottom" className="opacity-15" />
    </div>
  );
}
