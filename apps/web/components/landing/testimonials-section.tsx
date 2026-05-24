"use client";

import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Monkey D. Luffy",
    role: "Captain of the Straw Hat Pirates",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    quote:
      "AxeForm made it so easy to count our meat rations! Creating forms feels like mapping a new island. It's the most free way to collect opinions!",
    rating: 5,
  },
  {
    name: "Nami",
    role: "Navigator",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    quote:
      "The advanced analytics are extremely precise. Tracking our treasures and crew spending has never been this simple. Highly recommended for any serious organization.",
    rating: 5,
  },
  {
    name: "Dracule Mihawk",
    role: "Strongest Swordsman",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    quote:
      "A sharp, elegant tool. Building forms with custom Haki security is swift and precise. It does not waste a single pixel of space.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative py-24 px-6 md:px-12 bg-ocean-deep overflow-hidden"
    >
      {/* Decorative Mist */}
      <div className="absolute top-1/4 left-0 right-0 h-96 bg-radial-gradient-radial opacity-10 blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-16 relative z-10">
        <h2 className="font-heading text-4xl md:text-5xl text-wano-cream mb-4">
          Voices from the <span className="text-gradient-gold">Grand Line</span>
        </h2>
        <p className="text-wano-cream/60 text-lg max-w-2xl mx-auto">
          Hear what the most legendary captains and navigators say about AxeForm.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="parchment-card rounded-2xl p-8 relative flex flex-col justify-between shadow-2xl hover:scale-[1.03] transition-all duration-300"
          >
            {/* Ink-brush Quote Mark Decorative */}
            <span className="absolute top-4 left-4 font-serif text-8xl text-wano-crimson/10 leading-none select-none pointer-events-none">
              “
            </span>

            {/* Testimonial Quote */}
            <div className="relative z-10 flex-1">
              {/* Star Rating */}
              <div className="flex gap-1 mb-4 text-wano-crimson">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-ink-black/80 italic text-base leading-relaxed font-heading">
                "{t.quote}"
              </p>
            </div>

            {/* Profile Row */}
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-wano-gold/25">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-wano-gold/30">
                <Image src={t.avatar} alt={t.name} fill sizes="48px" className="object-cover" />
              </div>
              <div>
                <h4 className="font-heading text-base text-ink-black font-bold">{t.name}</h4>
                <p className="text-xs text-wano-crimson font-medium">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
