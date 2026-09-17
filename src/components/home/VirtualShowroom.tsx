"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { StorefrontTiltCard } from "../storefront/StorefrontTiltCard";
import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";

export function VirtualShowroom({ products = [] }: { products?: any[] }) {
  const [activePavilion, setActivePavilion] = useState<"wedding" | "everyday" | "vault" | "craft">("wedding");
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const pavilions = [
    {
      id: "wedding",
      title: "Wedding & Festive Pavilion",
      icon: "🏛",
      subtitle: "Royal Zari & Dabka Embroidered Bridal Collections",
      desc: "Immerse yourself in handcrafted silk velvet and golden zari threadwork designed for royal wedding celebrations, sangeet nights, and festive grandeur.",
      banner: PLACEHOLDER_HOMEPAGE_IMAGE,
      accent: "#C5A059"
    },
    {
      id: "everyday",
      title: "Everyday Elegance Studio",
      icon: "🌿",
      subtitle: "Genuine Leather Mojaris & Casual Luxury",
      desc: "Designed for day-long comfort with supple leather that molds naturally to your feet.",
      banner: PLACEHOLDER_HOMEPAGE_IMAGE,
      accent: "#8A1538"
    },
    {
      id: "vault",
      title: "Royal Exclusive Vault",
      icon: "✨",
      subtitle: "Limited-Edition Handcrafted Heritage Pairs",
      desc: "Bespoke Punjabi Juttis featuring sequin embroidery, pearl embellishments, and artisanal velvet lining.",
      banner: PLACEHOLDER_HOMEPAGE_IMAGE,
      accent: "#C5A059"
    },
    {
      id: "craft",
      title: "Craftsmanship Corner",
      icon: "👞",
      subtitle: "Interactive Anatomical & Artistry Hotspots",
      desc: "Explore the craft behind every pair — from hand-punched leather soles to padded velvet arch support.",
      banner: PLACEHOLDER_HOMEPAGE_IMAGE,
      accent: "#8A1538"
    }
  ];

  const hotspots = [
    { id: 1, top: "35%", left: "45%", title: "Hand Zari & Dabka Sequin Work", desc: "Stitched thread-by-thread by master Punjabi artisans with metallic gold yarn." },
    { id: 2, top: "65%", left: "30%", title: "Double-Padded Velvet Cushioning", desc: "Arch padding designed for all-day ease." },
    { id: 3, top: "75%", left: "65%", title: "Genuine Leather Sole", desc: "Flexible, breathable vegetable-tanned leather sole that molds to your natural foot shape." }
  ];

  const currentPavilion = pavilions.find(p => p.id === activePavilion)!;

  return (
    <section className="py-24 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-color-surface)] text-[var(--theme-color-accent)] text-xs uppercase tracking-widest font-semibold border border-[var(--theme-color-border)] shadow-sm rounded-full">
            <Sparkles className="w-4 h-4 text-[var(--theme-color-accent)]" />
            <span>Interactive Virtual Showroom</span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--theme-color-text)]">
            Step Into Our Virtual Pavilion
          </h2>

          <p className="text-[var(--theme-color-text-muted)] text-sm md:text-base leading-relaxed font-light">
            Experience Fashion Feet like walking through a luxury heritage boutique. Explore curated pavilions crafted for royal weddings, daily comfort, and master artisan embroidery.
          </p>
        </div>

        {/* Pavilion Navigation Tabs */}
        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
          {pavilions.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePavilion(p.id as any)}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 border ${
                activePavilion === p.id
                  ? "bg-[var(--theme-color-jewel)] text-white border-[var(--theme-color-accent)] shadow-lg"
                  : "bg-[var(--theme-color-surface)] text-[var(--theme-color-text-muted)] border-[var(--theme-color-border)] hover:border-[var(--theme-color-accent)]"
              }`}
            >
              <span className="text-base">{p.icon}</span>
              <span>{p.title}</span>
            </button>
          ))}
        </div>

        {/* Pavilion Showcase Content */}
        <div className="bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] rounded-2xl p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl">
          {/* Left Content Column */}
          <div className="lg:col-span-5 space-y-6">
            <span
              className="inline-block px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white shadow bg-[var(--theme-color-jewel)]"
            >
              {currentPavilion.title}
            </span>

            <h3 className="font-serif text-3xl md:text-4xl font-bold text-[var(--theme-color-text)] leading-tight">
              {currentPavilion.subtitle}
            </h3>

            <p className="text-[var(--theme-color-text-muted)] text-sm md:text-base leading-relaxed font-light">
              {currentPavilion.desc}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href="/shop"
                className="px-6 py-3.5 bg-[var(--theme-color-jewel)] text-white font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all rounded-xl shadow-lg flex items-center gap-2 border border-[var(--theme-color-border)]"
              >
                Explore Showcase <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/stores"
                className="px-6 py-3.5 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] font-bold text-xs uppercase tracking-widest hover:border-[var(--theme-color-accent)] transition-all rounded-xl border border-[var(--theme-color-border)]"
              >
                Experience Stores Coming Soon
              </Link>
            </div>
          </div>

          {/* Right Display Column */}
          <div className="lg:col-span-7">
            {activePavilion === "craft" ? (
              <div className="relative w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border border-[var(--theme-color-border)] bg-black/5 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPavilion.banner}
                  alt="Craftsmanship Corner"
                  className="w-full h-full object-cover"
                />
                {hotspots.map(spot => (
                  <div
                    key={spot.id}
                    className="absolute"
                    style={{ top: spot.top, left: spot.left }}
                  >
                    <button
                      onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                      className="w-8 h-8 rounded-full bg-[var(--theme-color-jewel)] text-white flex items-center justify-center font-bold text-xs shadow-2xl border border-white animate-pulse"
                    >
                      {spot.id}
                    </button>
                    {activeHotspot === spot.id && (
                      <div className="absolute left-10 top-0 w-64 bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] text-[var(--theme-color-text)] p-4 rounded-xl shadow-2xl z-20 space-y-1 text-xs">
                        <p className="font-serif font-bold text-[var(--theme-color-accent)]">{spot.title}</p>
                        <p className="text-[var(--theme-color-text-muted)] text-[11px] leading-relaxed">{spot.desc}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <StorefrontTiltCard className="relative w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border border-[var(--theme-color-border)] shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPavilion.banner}
                  alt={currentPavilion.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Fashion Feet Atelier</span>
                  <p className="font-serif text-2xl font-bold">{currentPavilion.subtitle}</p>
                </div>
              </StorefrontTiltCard>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
