"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/layout/app-sidebar";
import { Navbar } from "~/components/layout/navbar";
import { CreateFormDialog } from "~/components/dashboard/create-form-dialog";
import { toast } from "sonner";
import { Compass } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("axeform_auth_token");
    if (!token) {
      toast.error("Set sail from the login port first! (Authentication required)");
      router.push("/login");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-screen bg-ocean-deep text-wano-cream flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,30,58,0.04)_0%,transparent_60%)] pointer-events-none" />
        <div className="relative w-16 h-16 bg-wano-gold/10 border border-wano-gold/30 rounded-full flex items-center justify-center animate-pulse">
          <Compass
            className="w-8 h-8 text-wano-gold animate-spin"
            style={{ animationDuration: "3s" }}
          />
        </div>
        <p className="text-xs text-wano-gold/80 font-mono tracking-wider animate-pulse">
          Verifying Haki Log Pose...
        </p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen bg-ocean-deep text-wano-cream overflow-hidden">
        {/* The Sidebar navigation panel */}
        <AppSidebar />

        {/* The main scrollable content area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
          {/* Subtle mist drift backdrop in background */}
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[200px] bg-gradient-to-r from-wano-sakura/5 to-fruit-purple/5 rounded-full filter blur-[100px] pointer-events-none animate-mist-drift z-0" />

          {/* Sticky top navigation bar */}
          <Navbar onCreateFormClick={() => setIsCreateOpen(true)} />

          {/* Page Content area */}
          <main className="flex-1 overflow-y-auto px-6 py-8 relative z-10 axe-scrollbar">
            {children}
          </main>
        </div>

        {/* Global Create Form Modal Trigger */}
        <CreateFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>
    </SidebarProvider>
  );
}
