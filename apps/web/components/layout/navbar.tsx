"use client";

import { useState, useEffect } from "react";
import { Bell, Compass, HelpCircle, Plus, Search, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { SidebarTrigger } from "~/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { trpc } from "~/trpc/client";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import Link from "next/link";

interface NavbarProps {
  onCreateFormClick?: () => void;
}

function formatRelativeTime(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function Navbar({ onCreateFormClick }: NavbarProps) {
  const [userName, setUserName] = useState("Captain Luffy");
  const [userAvatar, setUserAvatar] = useState("");

  const { data: notifications, isLoading } = trpc.form.getRecentNotifications.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const [hasUnread, setHasUnread] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const lastRead = localStorage.getItem("axeform_last_read_notifications");
      const newestTime = new Date(notifications[0]!.submittedAt).getTime();
      if (!lastRead || newestTime > Number(lastRead)) {
        setHasUnread(true);
      }
    }
  }, [notifications]);

  const handleOpenNotifications = (open: boolean) => {
    setIsNotificationsOpen(open);
    if (open && notifications && notifications.length > 0) {
      setHasUnread(false);
      const newestTime = new Date(notifications[0]!.submittedAt).getTime();
      localStorage.setItem("axeform_last_read_notifications", String(newestTime));
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem("axeform_user_name");
    const storedAvatar = localStorage.getItem("axeform_user_avatar");
    if (storedName) {
      setUserName(storedName);
    }
    if (storedAvatar) {
      setUserAvatar(storedAvatar);
    }
  }, []);

  return (
    <header className="sticky top-0 right-0 left-0 h-16 glass-panel border-b border-ocean-surface/40 z-30 flex items-center justify-between px-6">
      {/* Left side: Sidebar Trigger & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-wano-cream/70 hover:text-wano-gold hover:bg-ocean-surface/50" />
        <div className="h-4 w-[1px] bg-ocean-surface" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-wano-cream/40">Ship Cabin</span>
          <span className="text-wano-gold font-bold">/</span>
          <span className="text-wano-cream font-medium">Dashboard</span>
        </div>
      </div>

      {/* Center/Right side: Actions & User Menu */}
      <div className="flex items-center gap-4">

        {/* Global Create Form CTA */}
        {onCreateFormClick && (
          <Button
            onClick={onCreateFormClick}
            className="btn-crimson rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Chart New Island
          </Button>
        )}

        {/* Help / Guide Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-wano-cream/70 hover:text-wano-gold hover:bg-ocean-surface/50 rounded-lg cursor-pointer"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-wano-gold/30 bg-ocean-deep/95 text-wano-cream p-6 rounded-2xl max-w-md shadow-2xl">
            <DialogHeader className="border-b border-ocean-surface/30 pb-3">
              <DialogTitle className="font-heading text-lg font-bold text-wano-gold uppercase tracking-wider flex items-center gap-2">
                🧭 Compass Guide: How AxeForm Works
              </DialogTitle>
              <DialogDescription className="text-xs text-wano-cream/55 mt-1 leading-relaxed">
                Learn how to chart, publish, and collect responses on your Grand Line survey voyages.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-3 text-xs leading-relaxed max-h-[400px] overflow-y-auto axe-scrollbar pr-1">
              <div className="space-y-1">
                <h4 className="font-bold text-wano-cream flex items-center gap-1.5 text-xs font-heading">
                  📋 1. What are Forms?
                </h4>
                <p className="text-wano-cream/70 text-[11px] leading-relaxed pl-5">
                  Forms are your customized surveys. You build them by adding different fields (questions) like text boxes, check lists, emails, or star ratings to collect information from other pirates.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-wano-cream flex items-center gap-1.5 text-xs font-heading">
                  ✨ 2. Form States (Set Sail or Anchor)
                </h4>
                <div className="space-y-2 pl-5 pt-1">
                  <div className="bg-ocean-mid/40 p-2.5 rounded-xl border border-fruit-glow/20">
                    <span className="font-bold text-fruit-glow text-[10px] uppercase font-mono block">
                      Published (Setting Sail)
                    </span>
                    <p className="text-[10px] text-wano-cream/65 mt-0.5 leading-relaxed">
                      Your form is fully live! Anyone with the direct survey link can open it and submit responses.
                    </p>
                  </div>

                  <div className="bg-ocean-mid/40 p-2.5 rounded-xl border border-wano-crimson/20">
                    <span className="font-bold text-wano-crimson text-[10px] uppercase font-mono block">
                      Unpublished (Anchored)
                    </span>
                    <p className="text-[10px] text-wano-cream/65 mt-0.5 leading-relaxed">
                      Your form is temporarily closed. The direct link is offline, and new responses are blocked, but all previously submitted responses are safely preserved.
                    </p>
                  </div>

                  <div className="bg-ocean-mid/40 p-2.5 rounded-xl border border-wano-cream/20">
                    <span className="font-bold text-wano-cream/60 text-[10px] uppercase font-mono block">
                      Draft (Parchment Locked)
                    </span>
                    <p className="text-[10px] text-wano-cream/65 mt-0.5 leading-relaxed">
                      A private copy for you to safely build and edit questions. It is hidden from the public until you decide to publish it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-wano-cream flex items-center gap-1.5 text-xs font-heading">
                  ⚙️ 3. Advanced Customizations & Logistics
                </h4>
                <div className="text-wano-cream/70 text-[11px] leading-relaxed pl-5 space-y-1.5">
                  <p>
                    Make your forms truly premium under the <strong className="text-wano-gold">Ship Settings</strong> tab:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 text-[10.5px]">
                    <li>
                      <strong className="text-wano-cream/90">Aesthetic Themes:</strong> Style your forms with custom layouts like sakura blossom calligraphies (<strong>Wano country</strong>), sci-fi data hud layers (<strong>Stark Tech</strong>), or tactical bat-signal spotlights (<strong>Gotham Knight</strong>).
                    </li>
                    <li>
                      <strong className="text-wano-cream/90">Haki Access Shields:</strong> Set up secure email verifications, password gates, or restrict repeated submissions to limit access.
                    </li>
                    <li>
                      <strong className="text-wano-cream/90">Limits & Expirations:</strong> Select expiration date caps or restrict the maximum response limit cargo before the form anchors.
                    </li>
                    <li>
                      <strong className="text-wano-cream/90">Messenger Birds:</strong> Enable email scrolls to dispatch instant notifications to your inbox when responses are logged.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-wano-cream flex items-center gap-1.5 text-xs font-heading">
                  🏆 4. What are Responses?
                </h4>
                <p className="text-wano-cream/70 text-[11px] leading-relaxed pl-5">
                  Every time a respondent fills out and submits your live form, it is recorded as a <strong className="text-fruit-glow">Response</strong> (your captured treasure). You can view the full responses log in the <strong className="text-wano-gold">"Treasures Collected"</strong> tab, or see beautiful visual trend charts under the <strong className="text-wano-sakura">"Sea Charts" (Analytics)</strong> tab of your form workspace cabin.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notifications (Den Den Mushi style) */}
        <Popover open={isNotificationsOpen} onOpenChange={handleOpenNotifications}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-wano-cream/70 hover:text-wano-gold hover:bg-ocean-surface/50 rounded-lg relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-wano-crimson animate-pulse" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="glass-panel border-wano-gold/30 bg-ocean-deep/95 text-wano-cream p-4 rounded-2xl w-80 shadow-2xl flex flex-col gap-3 z-50">
            <div className="flex items-center justify-between border-b border-ocean-surface/30 pb-2">
              <span className="font-heading text-xs font-bold text-wano-gold uppercase tracking-wider flex items-center gap-1.5">
                🐌 Den Den Mushi Logs
              </span>
              {notifications && notifications.length > 0 && (
                <span className="text-[10px] bg-wano-crimson/20 border border-wano-crimson/40 text-wano-crimson rounded-full px-2 py-0.5 font-bold font-mono">
                  {notifications.length} logs
                </span>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto axe-scrollbar pr-1 flex flex-col gap-2">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-wano-cream/50 flex flex-col items-center gap-2">
                  <div className="w-4 h-4 border-2 border-wano-gold border-t-transparent rounded-full animate-spin" />
                  Loading logs...
                </div>
              ) : !notifications || notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-wano-cream/40 flex flex-col items-center gap-2">
                  <span className="text-xl">🏜️</span>
                  No submission cargo logged yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.responseId}
                    href={`/dashboard/forms/${notif.formId}/responses`}
                    className="p-2.5 rounded-xl bg-ocean-mid/30 hover:bg-wano-crimson/10 border border-ocean-surface/40 hover:border-wano-crimson/35 transition flex flex-col gap-1 text-left group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-wano-cream/90 group-hover:text-wano-gold transition-colors line-clamp-1">
                        {notif.formTitle}
                      </span>
                      <span className="text-[9px] text-wano-cream/40 font-mono shrink-0 pt-0.5">
                        {formatRelativeTime(notif.submittedAt)} ago
                      </span>
                    </div>
                    <span className="text-[10px] text-wano-cream/60 line-clamp-1 italic">
                      New treasure logged from {notif.respondentEmail || "Anonymous Pirate"}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-ocean-surface" />

        {/* User Profile Trigger */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-ocean-surface border border-wano-gold/30 flex items-center justify-center text-wano-gold group-hover:border-wano-gold transition-colors text-sm">
            {userAvatar ? (
              userAvatar.startsWith("http://") || userAvatar.startsWith("https://") ? (
                <img
                  src={userAvatar}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{userAvatar}</span>
              )
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <span className="hidden md:inline text-xs font-medium text-wano-cream/80 group-hover:text-wano-sakura transition-colors">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
