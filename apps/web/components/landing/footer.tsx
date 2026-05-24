"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Explore", href: "/explore" },
    ],
    Resources: [
      { name: "Documentation", href: "#" },
      { name: "Changelog", href: "#" },
      { name: "Sea Chart Guide", href: "#" },
    ],
    Company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
    ],
  };

  return (
    <footer className="relative bg-[#07101C] pt-24 pb-12 border-t border-ocean-surface/40 overflow-hidden">
      {/* Wave pattern layout overlay */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none select-none z-10 rotate-180">
        <svg
          viewBox="0 0 1440 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-8 opacity-20"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C240,30 480,10 720,25 C960,40 1200,10 1440,0 L1440,40 L0,40 Z"
            fill="#C9A84C"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8 relative z-20">
        {/* Brand Block */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-wano-gold/30">
              <Image
                src="/axeform-logo.png"
                alt="AxeForm Logo"
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <span className="font-heading text-2xl font-bold text-gradient-gold">AxeForm</span>
          </Link>
          <p className="text-wano-cream/50 text-sm max-w-sm mt-2 leading-relaxed">
            The ultimate anime-themed form builder SaaS. Customize fields with Devil Fruit powers,
            password protect with Haki, and navigate stats like a Log Pose.
          </p>
        </div>

        {/* Links Columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title} className="flex flex-col gap-4">
            <h4 className="font-heading text-sm text-wano-gold font-bold uppercase tracking-wider">
              {title}
            </h4>
            <div className="flex flex-col gap-2.5">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-wano-cream/60 hover:text-wano-sakura text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-ocean-surface/20 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
        <span className="text-wano-cream/40 text-xs">
          &copy; 2026 AxeForm. Charting the Grand Line of Forms.
        </span>
        <div className="flex gap-6">
          <Link href="#" className="text-wano-cream/40 hover:text-wano-sakura text-xs">
            Privacy Policy
          </Link>
          <Link href="#" className="text-wano-cream/40 hover:text-wano-sakura text-xs">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
