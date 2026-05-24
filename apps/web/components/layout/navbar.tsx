"use client";

import { useState, useEffect } from "react";
import { Bell, Compass, HelpCircle, Plus, Search, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { SidebarTrigger } from "~/components/ui/sidebar";

interface NavbarProps {
  onCreateFormClick?: () => void;
}

export function Navbar({ onCreateFormClick }: NavbarProps) {
  const [userName, setUserName] = useState("Captain Luffy");
  const [userAvatar, setUserAvatar] = useState("");

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
        {/* Search Bar Metaphor - Sea Chart search */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ocean-deep/60 border border-ocean-surface w-64 text-wano-cream/40">
          <Search className="w-4 h-4 text-wano-cream/50" />
          <span className="text-xs">Search the Grand Line...</span>
        </div>

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

        {/* Help / Guide */}
        <Button
          variant="ghost"
          size="icon"
          className="text-wano-cream/70 hover:text-wano-gold hover:bg-ocean-surface/50 rounded-lg"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>

        {/* Notifications (Den Den Mushi style) */}
        <Button
          variant="ghost"
          size="icon"
          className="text-wano-cream/70 hover:text-wano-gold hover:bg-ocean-surface/50 rounded-lg relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-wano-crimson animate-pulse" />
        </Button>

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
