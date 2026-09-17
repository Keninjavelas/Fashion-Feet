"use client";

import { useState } from "react";
import { Sparkles, Award } from "lucide-react";
import { StorefrontTiltCard } from "../storefront/StorefrontTiltCard";
import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";

export function HeroEditorialShowcase({ 
  heroImage, 
  artisanImage1, 
  artisanImage2 
}: { 
  heroImage?: string; 
  artisanImage1?: string; 
  artisanImage2?: string; 
}) {
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);

  const showcaseAngles = [
    {
      id: "front",
      label: "Heritage Front",
      image: heroImage || PLACEHOLDER_HOMEPAGE_IMAGE,
      desc: "Intricate gold zari & dabka hand embroidery on rich royal crimson silk velvet."
    },
    {
      id: "embroidery",
      label: "Zari Detail",
      image: artisanImage1 || PLACEHOLDER_HOMEPAGE_IMAGE,
      desc: "Stitched thread-by-thread by Punjabi master artisans."
    },
    {
      id: "sole",
      label: "Leather Sole",
      image: artisanImage2 || PLACEHOLDER_HOMEPAGE_IMAGE,
      desc: "Anatomically molded vegetable-tanned leather for day-long ease."
    }
  ];

  const currentAngle = showcaseAngles[activeAngleIndex];

  return (
    <StorefrontTiltCard className="w-full max-w-md bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] backdrop-blur-xl p-6 rounded-3xl shadow-xl space-y-4">
      {/* High-Res Image Display */}
      <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-[var(--theme-color-border)] group shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentAngle.image}
          alt={currentAngle.label}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        <span className="absolute top-3 left-3 px-3 py-1 bg-[#12080C]/90 backdrop-blur-md text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#D4AF37]/30 flex items-center gap-1.5 shadow">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          Heritage Showcase
        </span>
      </div>

      {/* Angle Selector Tabs */}
      <div className="flex gap-2">
        {showcaseAngles.map((angle, idx) => (
          <button
            key={angle.id}
            onClick={() => setActiveAngleIndex(idx)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border ${
              activeAngleIndex === idx
                ? "bg-[var(--theme-color-jewel)] text-white border-[var(--theme-color-accent)] shadow-md"
                : "bg-[var(--theme-color-bg)] text-[var(--theme-color-text-muted)] border-[var(--theme-color-border)] hover:border-[var(--theme-color-accent)]"
            }`}
          >
            {angle.label}
          </button>
        ))}
      </div>

      {/* Description & Badges */}
      <div className="space-y-2 text-left pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--theme-color-accent)] uppercase font-bold tracking-widest">{currentAngle.label} View</span>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-600" /> 100% Handcrafted
          </span>
        </div>
        <h3 className="font-serif text-lg font-bold text-[var(--theme-color-text)]">Royal Crimson & Zari Gold</h3>
        <p className="text-xs text-[var(--theme-color-text-muted)] leading-relaxed">{currentAngle.desc}</p>
      </div>
    </StorefrontTiltCard>
  );
}
