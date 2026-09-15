"use client";

import { useState } from "react";
import { Sparkles, Layers, Scissors, ShieldCheck, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { StorefrontTiltCard } from "../storefront/StorefrontTiltCard";

const craftBeats = [
  {
    step: "01",
    title: "Raw Vegetable-Tanned Leather",
    subtitle: "Chrome-Free Anatomical Sole Foundation",
    desc: "Every pair begins with premium chrome-free leather sourced from heritage tanneries. Molded to adapt naturally to your foot's unique contours over time.",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop",
    icon: ShieldCheck,
    tag: "Beat 1: Tanning & Moulding"
  },
  {
    step: "02",
    title: "Double Velvet Arch Cushioning",
    subtitle: "Memory Foam Ergonomic Soles",
    desc: "Layered beneath rich silk velvet, our dual-density memory foam arch insert ensures zero bite marks and all-day royal comfort.",
    image: "https://images.unsplash.com/photo-1605807646983-377bc5a76493?q=80&w=1200&auto=format&fit=crop",
    icon: Layers,
    tag: "Beat 2: Ergonomic Arch"
  },
  {
    step: "03",
    title: "Artisanal Zari & Dabka Embroidery",
    subtitle: "Needlework by 3rd-Gen Punjabi Artisans",
    desc: "Stitched thread-by-thread using metallic gold zari yarn, sequins, and pearls. A single pair takes up to 40 hours of focused craftsmanship.",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop",
    icon: Scissors,
    tag: "Beat 3: Hand Embroidery"
  },
  {
    step: "04",
    title: "Heritage Fitting & Polish",
    subtitle: "Custom Boutique Finishing",
    desc: "Finished with natural beeswax conditioning and hand-checked for perfection before being wrapped in luxury heritage presentation boxes.",
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1200&auto=format&fit=crop",
    icon: Award,
    tag: "Beat 4: Final Inspection"
  }
];

export function CraftsmanshipScrollStory() {
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const currentBeat = craftBeats[activeBeatIndex];
  const IconComponent = currentBeat.icon;

  return (
    <section className="py-24 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--theme-color-surface)] text-[var(--theme-color-accent)] text-xs uppercase tracking-widest font-semibold border border-[var(--theme-color-border)] rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-[var(--theme-color-accent)]" />
            <span>Signature Craftsmanship Story</span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--theme-color-text)]">
            How a Royal Jutti is Born
          </h2>

          <p className="text-[var(--theme-color-text-muted)] text-sm md:text-base leading-relaxed font-light">
            Step through 4 authentic beats of handcrafted Punjabi footwear creation — from raw vegetable leather to hand zari embroidery.
          </p>
        </div>

        {/* Interactive Story Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Beat Selector Tabs */}
          <div className="lg:col-span-5 space-y-4">
            {craftBeats.map((beat, idx) => (
              <button
                key={beat.step}
                onClick={() => setActiveBeatIndex(idx)}
                className={`w-full text-left p-5 rounded-2xl transition-all border flex items-center justify-between group ${
                  activeBeatIndex === idx
                    ? "bg-[var(--theme-color-surface)] border-[var(--theme-color-accent)] shadow-xl scale-[1.02]"
                    : "bg-[var(--theme-color-surface)]/60 border-[var(--theme-color-border)] hover:border-[var(--theme-color-accent)]/50 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`font-serif text-xl font-bold ${
                    activeBeatIndex === idx ? "text-[var(--theme-color-accent)]" : "text-[var(--theme-color-text-muted)]"
                  }`}>
                    {beat.step}
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--theme-color-accent)] block">
                      {beat.tag}
                    </span>
                    <h3 className="font-serif font-bold text-base text-[var(--theme-color-text)]">
                      {beat.title}
                    </h3>
                  </div>
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  activeBeatIndex === idx ? "bg-[var(--theme-color-jewel)] text-white" : "bg-[var(--theme-color-bg)] text-[var(--theme-color-text-muted)]"
                }`}>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>

          {/* Right Column: Display Card with Interactive Tilt */}
          <div className="lg:col-span-7">
            <StorefrontTiltCard className="bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] rounded-3xl overflow-hidden shadow-2xl p-8 space-y-6">
              <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-[var(--theme-color-border)] shadow-inner group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentBeat.image}
                  alt={currentBeat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent p-6 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{currentBeat.subtitle}</span>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold">{currentBeat.title}</h3>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[var(--theme-color-accent)]">
                  <IconComponent className="w-4 h-4 text-[var(--theme-color-jewel)]" />
                  <span>{currentBeat.tag}</span>
                </div>
                <p className="text-sm md:text-base text-[var(--theme-color-text-muted)] leading-relaxed font-light">
                  {currentBeat.desc}
                </p>
                <div className="pt-2">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--theme-color-jewel)] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all border border-[var(--theme-color-border)] shadow-md"
                  >
                    Explore Heritage Artistry <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </StorefrontTiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
