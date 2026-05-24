"use client";

import Link from "next/link";
import { Sparkles, Layers, ShieldAlert, QrCode, Download, Shuffle, Anchor } from "lucide-react";
import { Button } from "~/components/ui/button";
import { LandingNavbar } from "~/components/landing/landing-navbar";
import { HeroSection } from "~/components/landing/hero-section";
import { FeatureCard } from "~/components/landing/feature-card";
import { WaveDivider } from "~/components/landing/wave-divider";
import { PricingSection } from "~/components/landing/pricing-section";
import { TestimonialsSection } from "~/components/landing/testimonials-section";
import { Footer } from "~/components/landing/footer";
import { ThemesSection } from "~/components/landing/themes-section";

export default function LandingPage() {
  const features = [
    {
      icon: <Layers className="w-6 h-6" />,
      title: "9 Field Types",
      description:
        "Paramecia-class powers to shape any form. Text, numbers, emails, checklists, dates, and ratings styled beautifully.",
    },
    {
      icon: <Shuffle className="w-6 h-6" />,
      title: "Conditional Logic",
      description:
        "Observation Haki in action. Configure fields that dynamically reveal themselves based on respondents' answers.",
    },
    {
      icon: <ShieldAlert className="w-6 h-6" />,
      title: "Haki Protection",
      description:
        "Armor your forms. Set standard SHA-256 password protection to ensure only authorized crew members can access.",
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "QR Code Sharing",
      description:
        "Generate physical maps. Create instant QR codes to share your islands (forms) across the open seas easily.",
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "CSV Export",
      description:
        "Collect your treasures in one chest. Export all responses in a standard clean CSV file format with one click.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "DB Driven Themes",
      description:
        "Wano wood textures, Sunny interiors, or Devil Fruit energies. Select gorgeous customized visual skins.",
    },
  ];

  return (
    <div className="min-h-screen bg-ocean-deep overflow-x-hidden font-body text-wano-cream selection:bg-wano-crimson selection:text-wano-cream">
      {/* Sticky Header Navbar */}
      <LandingNavbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Wave transition from Hero to Features */}
      <WaveDivider color="fill-ocean-mid" />

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6 md:px-12 bg-ocean-mid">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="font-heading text-4xl md:text-5xl text-wano-cream mb-4">
              Devil Fruit <span className="text-gradient-gold">Powers</span>
            </h2>
            <p className="text-wano-cream/60 text-lg max-w-2xl mx-auto">
              Equip your surveys and forms with supernatural abilities. Customize every aspect of
              the voyage.
            </p>
            <div
              className="w-24 h-1.5 bg-wano-crimson mx-auto mt-4 rounded-full"
              style={{
                clipPath:
                  "polygon(0% 40%, 15% 30%, 40% 60%, 65% 40%, 85% 65%, 100% 50%, 95% 80%, 75% 60%, 50% 80%, 25% 60%, 0% 70%)",
              }}
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard
                key={idx}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Wave transition from Features to Themes */}
      <WaveDivider flip color="fill-ocean-deep" />

      {/* Dynamic Themes Showcase Section */}
      <ThemesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Wave transition from Pricing to Testimonials */}
      <WaveDivider color="fill-ocean-deep" className="opacity-50" />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Conversion Banner */}
      <section className="relative py-24 px-6 md:px-12 bg-gradient-to-r from-wano-crimson to-wano-crimson-light overflow-hidden text-center">
        {/* Swirl Pattern decoration */}
        <div className="absolute inset-0 fruit-swirl opacity-5 mix-blend-overlay pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-wano-gold/15 filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-ocean-light/20 filter blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center gap-6">
          <h2 className="font-heading text-4xl md:text-5xl text-wano-cream leading-tight">
            Ready to Chart Your <span className="text-gradient-gold">First Island</span>?
          </h2>
          <p className="text-wano-cream/80 text-lg max-w-xl">
            Create your free cabin boy account today and discover how easy and epic building forms
            can be.
          </p>
          <Link href="/login" className="mt-4">
            <Button className="py-7 px-8 bg-wano-gold hover:bg-wano-gold-light text-ocean-deep text-base font-extrabold rounded-xl shadow-[0_4px_25px_rgba(201,168,76,0.4)] hover:scale-[1.03] transition-all duration-300 flex items-center gap-2">
              <Anchor className="w-5 h-5" />
              Claim Your Free Ship
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
