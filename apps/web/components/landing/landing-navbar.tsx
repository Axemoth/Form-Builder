"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Anchor } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Explore", href: "/explore" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 h-20 transition-all duration-300 z-50 flex items-center justify-between px-6 md:px-12",
        isScrolled
          ? "glass-panel bg-ocean-deep/80 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent",
      )}
    >
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-wano-gold/30">
          <Image
            src="/axeform-logo.png"
            alt="AxeForm Logo"
            fill
            sizes="40px"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <span className="font-heading text-2xl font-bold tracking-wide text-gradient-gold">
          AxeForm
        </span>
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="text-wano-cream/80 hover:text-wano-sakura text-sm font-medium tracking-wider uppercase transition-colors relative py-2 group"
          >
            {link.name}
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-wano-sakura transition-all duration-300 group-hover:w-full" />
          </Link>
        ))}
      </div>

      {/* Desktop CTA Action Button */}
      <div className="hidden md:block">
        <Link href="/login">
          <Button className="btn-crimson rounded-xl px-6 py-5 text-sm font-semibold flex items-center gap-2">
            <Anchor className="w-4 h-4" />
            Start Your Voyage
          </Button>
        </Link>
      </div>

      {/* Mobile Drawer trigger */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-wano-cream hover:bg-ocean-surface/50"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[300px] glass-panel border-l border-ocean-surface text-wano-cream p-8"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Logo in Drawer */}
                <div className="flex items-center gap-3 mb-12">
                  <div className="relative w-9 h-9 overflow-hidden rounded-lg border border-wano-gold/30">
                    <Image
                      src="/axeform-logo.png"
                      alt="AxeForm Logo"
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <span className="font-heading text-xl font-bold text-gradient-gold">AxeForm</span>
                </div>

                {/* Vertical Links */}
                <div className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-wano-cream/70 hover:text-wano-sakura text-lg font-medium tracking-wide transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile CTA */}
              <Link href="/login" className="w-full">
                <Button className="w-full btn-crimson rounded-xl py-6 text-sm font-semibold flex items-center justify-center gap-2">
                  <Anchor className="w-4 h-4" />
                  Start Your Voyage
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

// Add global cn utility injection if cn is not in scope in some contexts
import { cn } from "~/lib/utils";
