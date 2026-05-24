"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Compass,
  FileText,
  Globe,
  Settings,
  Anchor,
  HelpCircle,
  LogOut,
  ChevronRight,
  TrendingUp,
  Palette,
  ShieldAlert,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "~/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("axeform_user_role");
    if (role === "admin") {
      setIsAdmin(true);
    }
  }, []);

  const primaryNav = [
    { name: "Dashboard", href: "/dashboard", icon: Compass },
    { name: "Explore Map", href: "/explore", icon: Globe },
    { name: "Theme Gallery", href: "/dashboard/themes", icon: Palette },
  ];

  const handleAbandonShip = (e: React.MouseEvent) => {
    e.preventDefault();

    // Clear mock auth state
    localStorage.removeItem("axeform_auth_token");
    localStorage.removeItem("axeform_user_name");
    localStorage.removeItem("axeform_user_email");
    localStorage.removeItem("axeform_user_avatar");
    localStorage.removeItem("axeform_user_role");

    toast.success("Ship anchored. You have abandoned ship successfully.");

    router.push("/login");
  };

  return (
    <Sidebar className="border-r border-ocean-surface/40 bg-gradient-to-b from-ocean-deep to-ocean-mid text-wano-cream z-40">
      {/* Sidebar Header - AxeForm Logo */}
      <SidebarHeader className="h-16 px-6 border-b border-ocean-surface/40 flex items-center justify-between flex-row">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 overflow-hidden rounded-lg border border-wano-gold/30">
            <Image
              src="/axeform-logo.png"
              alt="AxeForm Logo"
              fill
              sizes="36px"
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="font-heading text-lg font-bold tracking-wide text-gradient-gold">
            AxeForm
          </span>
        </Link>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="px-3 py-4 flex flex-col gap-6 scrollbar-none">
        {/* Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-wano-cream/30 text-[10px] uppercase font-bold tracking-widest px-3 mb-2 font-heading">
            Voyage Navigation
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 relative group/btn",
                      isActive
                        ? "bg-wano-crimson text-wano-cream font-bold shadow-[0_0_15px_rgba(196,30,58,0.3)]"
                        : "text-wano-cream/70 hover:text-wano-cream hover:bg-ocean-surface/40",
                    )}
                  >
                    <Link href={item.href}>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "w-5 h-5 shrink-0 transition-transform group-hover/btn:scale-110 duration-300",
                            isActive ? "text-wano-cream" : "text-wano-gold",
                          )}
                        />
                        <span className="text-sm tracking-wide">{item.name}</span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300",
                          isActive && "opacity-100",
                        )}
                      />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Admin Navigation Group */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-wano-sakura/50 text-[10px] uppercase font-bold tracking-widest px-3 mb-2 font-heading flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-wano-sakura" />
              <span>HQ Command</span>
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 relative group/btn",
                    pathname === "/dashboard/admin"
                      ? "bg-wano-gold text-ocean-deep font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:text-ocean-deep"
                      : "text-wano-cream/70 hover:text-wano-cream hover:bg-ocean-surface/40",
                  )}
                >
                  <Link href="/dashboard/admin">
                    <div className="flex items-center gap-3">
                      <ShieldAlert
                        className={cn(
                          "w-5 h-5 shrink-0 transition-transform group-hover/btn:scale-110 duration-300",
                          pathname === "/dashboard/admin" ? "text-ocean-deep" : "text-wano-sakura",
                        )}
                      />
                      <span className="text-sm tracking-wide">Fleet Headquarters</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300",
                        pathname === "/dashboard/admin" && "opacity-100",
                      )}
                    />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Decorative divider */}
        <div className="px-3">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-wano-gold/20 to-transparent" />
        </div>

        {/* Nautical/Lore section */}
        <div className="px-4 py-3 rounded-xl bg-ocean-surface/20 border border-ocean-surface/30 text-xs text-wano-cream/50 relative overflow-hidden flex flex-col gap-2">
          {/* Subtle spiral background */}
          <div className="absolute inset-0 fruit-swirl opacity-[0.02]" />
          <div className="flex items-center gap-2 text-wano-gold font-heading font-semibold text-xs">
            <Anchor className="w-3.5 h-3.5" />
            <span>Grand Line Log Pose</span>
          </div>
          <p className="leading-relaxed">
            Currently docked at <strong>Wano Country</strong>. Ready to set sail to the next
            uncharted island.
          </p>
        </div>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="p-4 border-t border-ocean-surface/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-wano-cream/60 hover:text-wano-crimson hover:bg-wano-crimson/10 transition-colors cursor-pointer"
            >
              <button
                onClick={handleAbandonShip}
                className="w-full text-left flex items-center gap-3"
              >
                <LogOut className="w-5 h-5 text-wano-cream/40" />
                <span className="text-sm">Abandon Ship</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
