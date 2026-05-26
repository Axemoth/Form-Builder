"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { Check, Crown, Anchor, Swords } from "lucide-react";
import { Button } from "~/components/ui/button";

const plans = [
  {
    name: "Starter",
    icon: Anchor,
    price: { monthly: 0, annual: 0 },
    description: "Perfect for getting started with your first forms",
    cta: "Get Started",
    popular: false,
    features: [
      "5 Forms",
      "100 Responses per form",
      "Basic Analytics",
      "Community Support",
      "Standard Themes",
      "AxeForm Branding",
    ],
  },
  {
    name: "Professional",
    icon: Swords,
    price: { monthly: 19, annual: 15 },
    description: "For teams ready to scale their workflows",
    cta: "Upgrade Now",
    popular: true,
    features: [
      "Unlimited Forms",
      "10,000 Responses per form",
      "Advanced Analytics",
      "CSV Export",
      "Custom Themes",
      "Priority Support",
      "QR Code Sharing",
      "Password Protection",
      "No AxeForm Branding",
    ],
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: { monthly: 49, annual: 39 },
    description: "Full control with enterprise-grade features",
    cta: "Contact Sales",
    popular: false,
    features: [
      "Everything in First Mate",
      "API Access",
      "Custom Branding",
      "Team Collaboration",
      "White-label Forms",
      "Dedicated Support",
      "Conditional Logic",
      "Webhooks & Integrations",
      "99.9% SLA Uptime",
    ],
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="relative py-24 px-6 md:px-12 bg-ocean-deep">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="font-heading text-4xl md:text-5xl text-wano-cream mb-4">
          Choose Your <span className="text-gradient-gold">Plan</span>
        </h2>
        <p className="text-wano-cream/60 text-lg max-w-2xl mx-auto">
          Every growing team needs the right tools. Pick the plan that matches your
          ambitions.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              !isAnnual ? "text-wano-cream" : "text-wano-cream/40",
            )}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={cn(
              "relative w-14 h-7 rounded-full transition-all duration-300",
              isAnnual
                ? "bg-wano-crimson shadow-[0_0_15px_rgba(196,30,58,0.4)]"
                : "bg-ocean-surface",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-wano-cream transition-transform duration-300",
                isAnnual && "translate-x-7",
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              isAnnual ? "text-wano-cream" : "text-wano-cream/40",
            )}
          >
            Annual
          </span>
          {isAnnual && (
            <span className="ml-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-fruit-glow/20 text-fruit-glow border border-fruit-glow/30">
              Save 20%
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = isAnnual ? plan.price.annual : plan.price.monthly;

          return (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-8 flex flex-col transition-all duration-500",
                plan.popular
                  ? "bg-gradient-to-b from-ocean-mid via-ocean-mid to-ocean-deep border-2 border-wano-gold/50 scale-[1.02] md:scale-105 shadow-[0_0_40px_rgba(201,168,76,0.15)]"
                  : "bg-ocean-mid/80 border border-ocean-surface/50 hover:border-ocean-light/50",
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-wano-gold to-wano-gold-light text-ocean-deep text-xs font-bold uppercase tracking-wider shadow-lg">
                    <Crown className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Icon & Name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    plan.popular
                      ? "bg-wano-gold/20 text-wano-gold"
                      : "bg-ocean-surface/50 text-wano-cream/70",
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-xl text-wano-cream">{plan.name}</h3>
              </div>

              {/* Description */}
              <p className="text-wano-cream/50 text-sm mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-wano-cream font-heading">${price}</span>
                  {price > 0 && <span className="text-wano-cream/40 text-sm">/month</span>}
                </div>
                {price === 0 && <span className="text-wano-cream/40 text-sm">Free forever</span>}
                {isAnnual && price > 0 && (
                  <p className="text-fruit-glow/70 text-xs mt-1">Billed ${price * 12}/year</p>
                )}
              </div>

              {/* CTA Button */}
              <Button
                className={cn(
                  "w-full py-6 rounded-xl text-base font-semibold mb-8 transition-all duration-300",
                  plan.popular
                    ? "btn-crimson hover:shadow-[0_0_30px_rgba(196,30,58,0.4)]"
                    : "btn-gold-outline",
                )}
              >
                {plan.cta}
              </Button>

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={cn(
                        "w-4 h-4 mt-0.5 shrink-0",
                        plan.popular ? "text-wano-gold" : "text-fruit-glow/70",
                      )}
                    />
                    <span className="text-sm text-wano-cream/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Decorative swirl for popular plan */}
              {plan.popular && (
                <div className="absolute -bottom-2 -right-2 w-24 h-24 fruit-swirl-subtle rounded-full opacity-30 blur-xl" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
