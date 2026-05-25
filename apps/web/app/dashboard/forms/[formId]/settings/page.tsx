"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { FormWorkspaceHeader } from "~/components/layout/form-workspace-header";
import {
  Compass,
  Loader2,
  Lock,
  Mail,
  Shield,
  Clock,
  QrCode,
  Save,
  Globe,
  Settings2,
  Bell,
  Eye,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import Image from "next/image";
import { cn } from "~/lib/utils";

export default function FormSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  // States for general settings
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("draft");
  const [visibility, setVisibility] = useState("public");
  const [submitButtonText, setSubmitButtonText] = useState("Submit");
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [themeName, setThemeName] = useState("wano");
  const [isMultiPage, setIsMultiPage] = useState(false);

  // States for Access controls (Haki security)
  const [requireEmail, setRequireEmail] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [password, setPassword] = useState("");
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);

  // States for Expiry/Limits
  const [responseLimit, setResponseLimit] = useState<number | "">("");
  const [isResponseLimitEnabled, setIsResponseLimitEnabled] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [isExpiryEnabled, setIsExpiryEnabled] = useState(false);

  // States for Notifications (Email Notifications)
  const [notifyCreator, setNotifyCreator] = useState(false);
  const [notifyRespondent, setNotifyRespondent] = useState(false);

  // Load form details via tRPC
  const {
    data: form,
    isLoading,
    error,
    refetch,
  } = trpc.form.getFormById.useQuery({ id: formId }, { refetchOnWindowFocus: false });

  // Load QR code details
  const { data: qrCode } = trpc.form.getFormQrCode.useQuery(
    { slug: form?.slug || "" },
    { enabled: !!form?.slug },
  );

  // Load Notification Settings
  const { data: notificationSettings, refetch: refetchNotifs } =
    trpc.form.getEmailNotificationSettings.useQuery({ formId }, { refetchOnWindowFocus: false });

  // Initialize states
  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description || "");
      setSlug(form.slug);
      setStatus(form.status);
      setVisibility(form.visibility);
      setSubmitButtonText(form.submitButtonText || "Submit");
      setSuccessMessage(form.successMessage || "");
      setRedirectUrl(form.redirectUrl || "");
      setThemeName(form.themeName || "wano");
      setIsMultiPage(form.isMultiPage);

      setRequireEmail(form.requireEmail);
      setAllowMultiple(form.allowMultipleResponses);
      setIsPasswordEnabled(!!form.passwordHash);
      setPassword("");

      // Expiry fields
      if (form.expiresAt) {
        setExpiresAt(new Date(form.expiresAt).toISOString().split("T")[0]!);
        setIsExpiryEnabled(true);
      } else {
        setExpiresAt("");
        setIsExpiryEnabled(false);
      }

      // Response Limits
      if (form.responseLimit) {
        setResponseLimit(form.responseLimit);
        setIsResponseLimitEnabled(true);
      } else {
        setResponseLimit("");
        setIsResponseLimitEnabled(false);
      }
    }
  }, [form]);

  // Sync notification settings
  useEffect(() => {
    if (notificationSettings) {
      setNotifyCreator(notificationSettings.notifyCreator);
      setNotifyRespondent(notificationSettings.notifyRespondent);
    }
  }, [notificationSettings]);

  // Mutations
  const updateFormMutation = trpc.form.updateForm.useMutation();
  const saveNotifSettingsMutation = trpc.form.saveEmailNotificationSettings.useMutation();

  const handleSaveSettings = async () => {
    try {
      // 1. Save general and access settings
      await updateFormMutation.mutateAsync({
        id: formId,
        title,
        description: description || undefined,
        slug,
        status: status as any,
        visibility: visibility as any,
        submitButtonText,
        successMessage: successMessage || undefined,
        redirectUrl: redirectUrl || undefined,
        requireEmail,
        themeName,
        allowMultipleResponses: allowMultiple,
        isMultiPage,
        password: isPasswordEnabled && password ? password : isPasswordEnabled ? undefined : "", // clear password if disabled
        responseLimit:
          isResponseLimitEnabled && responseLimit ? Number(responseLimit) : (null as any),
        expiresAt: isExpiryEnabled && expiresAt ? new Date(expiresAt).toISOString() : (null as any),
      });

      // 2. Save notification settings
      await saveNotifSettingsMutation.mutateAsync({
        formId,
        notifyCreator,
        notifyRespondent,
      });

      toast.success("Ship log updated successfully! Coordinates aligned.");
      refetch();
      refetchNotifs();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update ship coordinates.");
    }
  };

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Island survey link copied!");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-wano-cream/40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-wano-gold" />
        <h3 className="font-heading text-lg font-bold text-wano-cream">Aligning Log Pose...</h3>
        <p className="text-xs">Fetching access metrics and configuring cargo settings.</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-ocean-mid/20 rounded-2xl border-2 border-dashed border-wano-crimson/30 max-w-xl mx-auto p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-wano-crimson/10 border border-wano-crimson/30 flex items-center justify-center text-wano-crimson mb-6">
          <Compass className="w-7 h-7" />
        </div>
        <h3 className="font-heading text-lg font-bold text-wano-cream mb-2">
          Island Hidden by Fog
        </h3>
        <p className="text-xs text-wano-cream/50 mb-6">
          {error?.message || "We could not trace this island setting credentials on the sea maps."}
        </p>
        <Button onClick={() => router.push("/dashboard")} className="btn-crimson">
          Return to Cabin
        </Button>
      </div>
    );
  }

  const isSaving = updateFormMutation.isPending || saveNotifSettingsMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Shared Header Navigation */}
      <FormWorkspaceHeader
        formId={formId}
        title={title}
        status={status}
        slug={slug}
        activeTab="settings"
      />

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="general" className="w-full flex flex-col md:flex-row gap-8">
          {/* Side Tabs List */}
          <TabsList className="flex flex-row md:flex-col bg-ocean-mid/40 border border-ocean-surface/30 p-1.5 rounded-2xl md:w-64 shrink-0 justify-start overflow-x-auto md:overflow-x-visible h-auto space-x-1 md:space-x-0 md:space-y-1 axe-scrollbar">
            <TabsTrigger
              value="general"
              className="flex items-center gap-2.5 px-4 py-3 justify-start rounded-xl text-xs font-semibold font-heading text-wano-cream/60 hover:text-wano-cream hover:bg-ocean-surface/30 data-[state=active]:bg-wano-gold/15 data-[state=active]:text-wano-gold dark:text-wano-cream/60 dark:hover:text-wano-cream dark:data-[state=active]:text-wano-gold w-full text-left transition-all duration-200"
            >
              <Settings2 className="w-4 h-4 shrink-0" />
              General Settings
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2.5 px-4 py-3 justify-start rounded-xl text-xs font-semibold font-heading text-wano-cream/60 hover:text-wano-cream hover:bg-ocean-surface/30 data-[state=active]:bg-wano-gold/15 data-[state=active]:text-wano-gold dark:text-wano-cream/60 dark:hover:text-wano-cream dark:data-[state=active]:text-wano-gold w-full text-left transition-all duration-200"
            >
              <Shield className="w-4 h-4 shrink-0" />
              Security & Access
            </TabsTrigger>
            <TabsTrigger
              value="limits"
              className="flex items-center gap-2.5 px-4 py-3 justify-start rounded-xl text-xs font-semibold font-heading text-wano-cream/60 hover:text-wano-cream hover:bg-ocean-surface/30 data-[state=active]:bg-wano-gold/15 data-[state=active]:text-wano-gold dark:text-wano-cream/60 dark:hover:text-wano-cream dark:data-[state=active]:text-wano-gold w-full text-left transition-all duration-200"
            >
              <Clock className="w-4 h-4 shrink-0" />
              Limits & Expiry
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2.5 px-4 py-3 justify-start rounded-xl text-xs font-semibold font-heading text-wano-cream/60 hover:text-wano-cream hover:bg-ocean-surface/30 data-[state=active]:bg-wano-gold/15 data-[state=active]:text-wano-gold dark:text-wano-cream/60 dark:hover:text-wano-cream dark:data-[state=active]:text-wano-gold w-full text-left transition-all duration-200"
            >
              <Bell className="w-4 h-4 shrink-0" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="sharing"
              className="flex items-center gap-2.5 px-4 py-3 justify-start rounded-xl text-xs font-semibold font-heading text-wano-cream/60 hover:text-wano-cream hover:bg-ocean-surface/30 data-[state=active]:bg-wano-gold/15 data-[state=active]:text-wano-gold dark:text-wano-cream/60 dark:hover:text-wano-cream dark:data-[state=active]:text-wano-gold w-full text-left transition-all duration-200"
            >
              <QrCode className="w-4 h-4 shrink-0" />
              Share & Embed
            </TabsTrigger>
          </TabsList>

          {/* TAB PANELS CONTENT */}
          <div className="flex-1 bg-ocean-mid/20 border border-ocean-surface/20 p-6 md:p-8 rounded-2xl shadow-md min-h-[400px] relative overflow-hidden">
            {/* Swirl pulse backdrop detail */}
            <div className="absolute -bottom-16 -right-16 w-48 h-48 fruit-swirl-subtle rounded-full opacity-5 blur-2xl pointer-events-none" />

            {/* 1. GENERAL TAB */}
            <TabsContent value="general" className="space-y-5 mt-0 outline-none">
              <div className="border-b border-ocean-surface/20 pb-3 mb-2">
                <h3 className="font-heading text-lg font-bold text-wano-cream flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-wano-gold" />
                  General Settings
                </h3>
                <p className="text-[11px] text-wano-cream/45">
                  Setup your core island parameters and communication logs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                    Title <span className="text-wano-crimson">*</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-ocean-deep/60 border-ocean-surface focus:border-wano-gold/40 focus:ring-0 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                    Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-ocean-deep/60 border-ocean-surface focus:border-wano-gold/40 focus:ring-0 rounded-xl resize-none text-xs h-20"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                    Slug Path <span className="text-wano-crimson">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-wano-cream/30 font-mono">
                      /f/
                    </span>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="bg-ocean-deep/60 border-ocean-surface focus:border-wano-gold/40 focus:ring-0 rounded-xl text-xs pl-8 text-wano-gold font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                    Form Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-ocean-deep/60 border-ocean-surface text-wano-cream rounded-xl text-xs focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-ocean-surface text-wano-cream">
                      <SelectItem value="draft" className="text-xs hover:bg-ocean-surface/60">
                        Draft (Parchment locked)
                      </SelectItem>
                      <SelectItem value="published" className="text-xs hover:bg-ocean-surface/60">
                        Published (Setting sail)
                      </SelectItem>
                      <SelectItem value="unpublished" className="text-xs hover:bg-ocean-surface/60">
                        Unpublished (Anchored)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                    Submit Button Text
                  </Label>
                  <Input
                    value={submitButtonText}
                    onChange={(e) => setSubmitButtonText(e.target.value)}
                    className="bg-ocean-deep/60 border-ocean-surface focus:border-wano-gold/40 focus:ring-0 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                    Success Message
                  </Label>
                  <Textarea
                    value={successMessage}
                    onChange={(e) => setSuccessMessage(e.target.value)}
                    placeholder="e.g. Thank you! Your response is locked inside the treasure chest!"
                    className="bg-ocean-deep/60 border-ocean-surface focus:border-wano-gold/40 focus:ring-0 rounded-xl resize-none text-xs h-20"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                    Redirect URL
                  </Label>
                  <Input
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="https://mygrandline.com/success"
                    className="bg-ocean-deep/60 border-ocean-surface focus:border-wano-gold/40 focus:ring-0 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-ocean-deep/40 rounded-xl border border-ocean-surface/20 col-span-2 mt-2">
                  <div className="space-y-1 pr-4 text-left">
                    <div className="text-xs font-bold text-wano-cream flex items-center gap-1.5 font-heading">
                      <Compass className="w-3.5 h-3.5 text-wano-gold" />
                      Multi-Page Form Experience
                    </div>
                    <div className="text-[10px] text-wano-cream/40 leading-relaxed">
                      Render each question step-by-step with clean page transitions instead of
                      listing them all on a single scrolling page.
                    </div>
                  </div>
                  <Switch checked={isMultiPage} onCheckedChange={setIsMultiPage} />
                </div>

                {/* Dynamic Theme & Aesthetic Selection */}
                <div className="space-y-3 col-span-2 mt-4 pt-4 border-t border-ocean-surface/20">
                  <Label className="text-[10px] uppercase tracking-wider text-wano-gold font-bold font-heading flex items-center gap-1.5">
                    ✨ Island Theme & Aesthetic
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Wano Theme Choice */}
                    <div
                      onClick={() => setThemeName("wano")}
                      className={cn(
                        "relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group select-none min-h-[96px]",
                        themeName === "wano"
                          ? "bg-ocean-deep/60 border-wano-gold shadow-[0_0_12px_rgba(201,168,76,0.15)]"
                          : "bg-ocean-deep/30 border-ocean-surface/40 hover:border-ocean-surface/80 hover:bg-ocean-deep/50",
                      )}
                    >
                      {/* Corner details */}
                      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-wano-gold" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌸</span>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-wano-cream font-heading">
                            Wano Country Theme
                          </h4>
                          <p className="text-[10px] text-wano-cream/40 leading-relaxed mt-0.5">
                            Original One Piece styling with falling sakura cherry blossoms and gold
                            calligraphy borders.
                          </p>
                        </div>
                      </div>
                      {themeName === "wano" && (
                        <div className="absolute bottom-1 right-2 text-[9px] font-heading font-bold text-wano-gold tracking-widest uppercase">
                          ACTIVE VOYAGE
                        </div>
                      )}
                    </div>

                    {/* Stark Tech Theme Choice */}
                    <div
                      onClick={() => setThemeName("stark")}
                      className={cn(
                        "relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group select-none min-h-[96px]",
                        themeName === "stark"
                          ? "bg-ocean-deep/60 border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                          : "bg-ocean-deep/30 border-ocean-surface/40 hover:border-ocean-surface/80 hover:bg-ocean-deep/50",
                      )}
                    >
                      {/* Circular tech ring decoration */}
                      <div
                        className="absolute -top-3 -right-3 w-12 h-12 rounded-full border border-[#00f0ff]/5 pointer-events-none group-hover:border-[#00f0ff]/10 transition-colors animate-spin"
                        style={{ animationDuration: "12s" }}
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🛡️</span>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-wano-cream font-heading">
                            Stark Tech Theme
                          </h4>
                          <p className="text-[10px] text-wano-cream/40 leading-relaxed mt-0.5">
                            Futuristic Avengers/Jarvis blueprints with floating data grid lines and
                            electric cyan HUD accents.
                          </p>
                        </div>
                      </div>
                      {themeName === "stark" && (
                        <div className="absolute bottom-1 right-2 text-[9px] font-heading font-bold text-[#00f0ff] tracking-widest uppercase">
                          ACTIVE HUD
                        </div>
                      )}
                    </div>

                    {/* Gotham Knight Theme Choice (Batman) */}
                    <div
                      onClick={() => setThemeName("batman")}
                      className={cn(
                        "relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group select-none min-h-[96px]",
                        themeName === "batman"
                          ? "bg-ocean-deep/60 border-[#F5B921] shadow-[0_0_12px_rgba(245,185,33,0.15)]"
                          : "bg-ocean-deep/30 border-ocean-surface/40 hover:border-ocean-surface/80 hover:bg-ocean-deep/50",
                      )}
                    >
                      {/* Spot light overlay */}
                      <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-[#F5B921]/5 pointer-events-none rounded-full blur-xl group-hover:bg-[#F5B921]/10 transition-colors" />
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🦇</span>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-wano-cream font-heading">
                            Gotham Knight
                          </h4>
                          <p className="text-[10px] text-wano-cream/40 leading-relaxed mt-0.5">
                            Gothic charcoal overlays, golden Bat-Signal spotlights, tactical
                            blueprint grids, and custom Bat-Symbol ratings.
                          </p>
                        </div>
                      </div>
                      {themeName === "batman" && (
                        <div className="absolute bottom-1 right-2 text-[9px] font-heading font-bold text-[#F5B921] tracking-widest uppercase">
                          GOTHAM SYS
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 2. SECURITY TAB */}
            <TabsContent value="security" className="space-y-5 mt-0 outline-none">
              <div className="border-b border-ocean-surface/20 pb-3 mb-2">
                <h3 className="font-heading text-lg font-bold text-wano-cream flex items-center gap-2">
                  <Shield className="w-5 h-5 text-wano-gold" />
                  Security & Access
                </h3>
                <p className="text-[11px] text-wano-cream/45">
                  Apply Conqueror's Haki shields to password lock or isolate respondents.
                </p>
              </div>

              <div className="space-y-5">
                {/* Visibility option */}
                <div className="flex items-center justify-between p-4 bg-ocean-deep/40 rounded-xl border border-ocean-surface/20">
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="text-xs font-bold text-wano-cream flex items-center gap-1.5 font-heading">
                      <Globe className="w-3.5 h-3.5 text-wano-gold" />
                      Visibility Setting
                    </div>
                    <div className="text-[10px] text-wano-cream/40 leading-relaxed">
                      Public forms appear on the Explore Map grid. Unlisted forms are hidden except
                      via direct link.
                    </div>
                  </div>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger className="bg-ocean-deep/60 border-ocean-surface text-wano-cream rounded-xl text-xs w-32 focus:ring-0 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-ocean-surface text-wano-cream">
                      <SelectItem value="public" className="text-xs">
                        Public Map
                      </SelectItem>
                      <SelectItem value="unlisted" className="text-xs">
                        Unlisted Route
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Require Email */}
                <div className="flex items-center justify-between p-4 bg-ocean-deep/40 rounded-xl border border-ocean-surface/20">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-wano-cream flex items-center gap-1.5 font-heading">
                      <Mail className="w-3.5 h-3.5 text-wano-gold" />
                      Require Email
                    </div>
                    <div className="text-[10px] text-wano-cream/40 leading-relaxed">
                      Respondents must declare their email address in order to file answers.
                    </div>
                  </div>
                  <Switch checked={requireEmail} onCheckedChange={setRequireEmail} />
                </div>

                {/* Allow Multiple */}
                <div className="flex items-center justify-between p-4 bg-ocean-deep/40 rounded-xl border border-ocean-surface/20">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-wano-cream flex items-center gap-1.5 font-heading">
                      <Compass className="w-3.5 h-3.5 text-wano-gold" />
                      Allow Multiple Responses
                    </div>
                    <div className="text-[10px] text-wano-cream/40 leading-relaxed">
                      Let the same ship file multiple survey responses. Turn off to restrict
                      repeated submissions.
                    </div>
                  </div>
                  <Switch checked={allowMultiple} onCheckedChange={setAllowMultiple} />
                </div>

                {/* Password Protection */}
                <div className="p-4 bg-ocean-deep/40 rounded-xl border border-ocean-surface/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-wano-cream flex items-center gap-1.5 font-heading">
                        <Lock className="w-3.5 h-3.5 text-wano-gold" />
                        Password Protection
                      </div>
                      <div className="text-[10px] text-wano-cream/40 leading-relaxed">
                        Respondents must unlock the island barrier using a passcode before answering
                        questions.
                      </div>
                    </div>
                    <Switch checked={isPasswordEnabled} onCheckedChange={setIsPasswordEnabled} />
                  </div>

                  {isPasswordEnabled && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <Label className="text-[9px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                        Password
                      </Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter coordinate pass code..."
                        className="bg-ocean-deep/60 border-ocean-surface text-wano-cream text-xs focus:border-wano-gold/45 focus:ring-0 rounded-xl"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* 3. LIMITS TAB */}
            <TabsContent value="limits" className="space-y-5 mt-0 outline-none">
              <div className="border-b border-ocean-surface/20 pb-3 mb-2">
                <h3 className="font-heading text-lg font-bold text-wano-cream flex items-center gap-2">
                  <Clock className="w-5 h-5 text-wano-gold" />
                  Limits & Expiry
                </h3>
                <p className="text-[11px] text-wano-cream/45">
                  Set expiration thresholds or response caps before the island sinks.
                </p>
              </div>

              <div className="space-y-5">
                {/* Expire settings */}
                <div className="p-4 bg-ocean-deep/40 rounded-xl border border-ocean-surface/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-wano-cream flex items-center gap-1.5 font-heading">
                        <Clock className="w-3.5 h-3.5 text-wano-gold" />
                        Expiration Date
                      </div>
                      <div className="text-[10px] text-wano-cream/40 leading-relaxed">
                        Specify a strict expiration limit when the form will auto-close and refuse
                        entries.
                      </div>
                    </div>
                    <Switch checked={isExpiryEnabled} onCheckedChange={setIsExpiryEnabled} />
                  </div>

                  {isExpiryEnabled && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <Label className="text-[9px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                        Date
                      </Label>
                      <Input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="bg-ocean-deep/60 border-ocean-surface text-wano-cream text-xs focus:border-wano-gold/45 focus:ring-0 rounded-xl w-full sm:w-48"
                      />
                    </div>
                  )}
                </div>

                {/* Response limit */}
                <div className="p-4 bg-ocean-deep/40 rounded-xl border border-ocean-surface/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-wano-cream flex items-center gap-1.5 font-heading">
                        <Compass className="w-3.5 h-3.5 text-wano-gold" />
                        Response Count Limit
                      </div>
                      <div className="text-[10px] text-wano-cream/40 leading-relaxed">
                        Max submission threshold. Submissions shut off once this number is met.
                      </div>
                    </div>
                    <Switch
                      checked={isResponseLimitEnabled}
                      onCheckedChange={setIsResponseLimitEnabled}
                    />
                  </div>

                  {isResponseLimitEnabled && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <Label className="text-[9px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                        Response Cap
                      </Label>
                      <Input
                        type="number"
                        value={responseLimit}
                        onChange={(e) =>
                          setResponseLimit(e.target.value !== "" ? Number(e.target.value) : "")
                        }
                        placeholder="e.g. 100 responses limit"
                        className="bg-ocean-deep/60 border-ocean-surface text-wano-cream text-xs focus:border-wano-gold/45 focus:ring-0 rounded-xl w-full sm:w-48"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* 4. NOTIFICATIONS TAB */}
            <TabsContent value="notifications" className="space-y-5 mt-0 outline-none">
              <div className="border-b border-ocean-surface/20 pb-3 mb-2">
                <h3 className="font-heading text-lg font-bold text-wano-cream flex items-center gap-2">
                  <Bell className="w-5 h-5 text-wano-gold" />
                  Notifications
                </h3>
                <p className="text-[11px] text-wano-cream/45">
                  Configure News Coos to dispatch email scrolls dynamically on answer logs.
                </p>
              </div>

              <div className="space-y-5">
                {/* Notify Creator */}
                <div className="flex items-center justify-between p-4 bg-ocean-deep/40 rounded-xl border border-ocean-surface/20">
                  <div className="space-y-1 pr-4">
                    <div className="text-xs font-bold text-wano-cream flex items-center gap-1.5 font-heading">
                      <Bell className="w-3.5 h-3.5 text-wano-gold" />
                      Creator Notification
                    </div>
                    <div className="text-[10px] text-wano-cream/40 leading-relaxed">
                      News Coo bird flies directly to your inbox (`
                      {form?.userId ? "captain@cabin.com" : "authenticated-owner"}`) instantly on
                      every new submission.
                    </div>
                  </div>
                  <Switch checked={notifyCreator} onCheckedChange={setNotifyCreator} />
                </div>

                {/* Notify Respondent */}
                <div className="flex items-center justify-between p-4 bg-ocean-deep/40 rounded-xl border border-ocean-surface/20">
                  <div className="space-y-1 pr-4">
                    <div className="text-xs font-bold text-wano-cream flex items-center gap-1.5 font-heading">
                      <Mail className="w-3.5 h-3.5 text-wano-gold" />
                      Respondent Notification
                    </div>
                    <div className="text-[10px] text-wano-cream/40 leading-relaxed">
                      Send a thank-you confirmation email with a copy of answered coordinates back
                      to the respondent automatically (requires Log Email enabled).
                    </div>
                  </div>
                  <Switch checked={notifyRespondent} onCheckedChange={setNotifyRespondent} />
                </div>
              </div>
            </TabsContent>

            {/* 5. SHARING TAB */}
            <TabsContent value="sharing" className="space-y-5 mt-0 outline-none">
              <div className="border-b border-ocean-surface/20 pb-3 mb-2">
                <h3 className="font-heading text-lg font-bold text-wano-cream flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-wano-gold" />
                  Share & Embed
                </h3>
                <p className="text-[11px] text-wano-cream/45">
                  Expose your island coordinates or generate interactive QR codes for pirates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: QR Display */}
                <div className="md:col-span-4 flex flex-col items-center justify-center bg-ocean-deep/40 p-4 rounded-2xl border border-ocean-surface/30">
                  {qrCode?.qrCodeUrl ? (
                    <div className="relative w-40 h-40 bg-[#FFFFFF] p-2 rounded-xl border-2 border-wano-gold/30 flex items-center justify-center overflow-hidden">
                      <Image
                        src={qrCode.qrCodeUrl}
                        alt="Form QR Code"
                        width={150}
                        height={150}
                        unoptimized
                        className="rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-ocean-deep border border-dashed border-ocean-surface/60 rounded-xl flex items-center justify-center text-wano-cream/20">
                      <Loader2 className="w-6 h-6 animate-spin text-wano-gold" />
                    </div>
                  )}
                  <span className="text-[9px] text-wano-cream/40 font-mono mt-3 uppercase tracking-wider">
                    Log Pose QR Scanner
                  </span>
                </div>

                {/* Right: Link & Embeds details */}
                <div className="md:col-span-8 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                      Survey URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/f/${slug}`}
                        className="bg-ocean-deep/60 border-ocean-surface text-wano-gold text-xs rounded-xl font-mono flex-1 select-all"
                      />
                      <Button
                        onClick={handleCopyLink}
                        className="btn-crimson text-xs rounded-xl px-4 font-bold shadow-md h-auto"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase tracking-wider text-wano-cream/60 font-semibold font-heading">
                      iFrame Embed Code
                    </Label>
                    <Textarea
                      readOnly
                      value={`<iframe src="${window.location.origin}/f/${slug}" width="100%" height="700px" frameborder="0"></iframe>`}
                      className="bg-ocean-deep/60 border-ocean-surface text-wano-cream/70 text-[10px] rounded-xl font-mono resize-none h-16 select-all axe-scrollbar"
                    />
                    <span className="text-[9px] text-wano-cream/30 block leading-tight">
                      Paste this HTML frame to host this survey on your own custom web crew page.
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Bottom Actions Row (For saving changed parameters) */}
            <div className="border-t border-ocean-surface/20 pt-6 mt-8 flex items-center justify-between">
              <span className="text-[10px] text-wano-cream/30 font-mono leading-none">
                * Sync settings before exit
              </span>
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="btn-crimson hover:shadow-[0_0_15px_rgba(196,30,58,0.4)] text-wano-cream font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating Pose...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Update settings ⚓
                  </>
                )}
              </Button>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
