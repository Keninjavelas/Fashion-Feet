"use client";

import { useMemo, useState } from "react";
import { Sparkles, Award } from "lucide-react";
import { StorefrontTiltCard } from "../storefront/StorefrontTiltCard";
import { ThreeJuttiHeroCanvas } from "../three/ThreeJuttiHeroCanvas";
import { FOOTWEAR_DESIGN_TOKENS, type AccentSwatchName } from "../three/ProceduralPunjabiJutti";

export function HeroEditorialShowcase() {
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [activeAccent, setActiveAccent] = useState<AccentSwatchName>('crimson');

  const showcaseAngles = useMemo(
    () => [
      {
        id: "front",
        label: "3D Live",
        accent: activeAccent as AccentSwatchName,
        desc: "Spin the model with your mouse or touch to inspect every zari stitch and the hand-finished leather sole.",
      },
      {
        id: "embroidery",
        label: "Zari Detail",
        accent: activeAccent as AccentSwatchName,
        desc: "Gold zari lattice stitches with mirror-finish dabka sequins, laid thread-by-thread by Punjabi master artisans.",
      },
      {
        id: "sole",
        label: "Leather Sole",
        accent: activeAccent as AccentSwatchName,
        desc: "Anatomically moulded vegetable-tanned leather with a rounded toe profile, for all-day bridal comfort.",
      },
    ],
    [activeAccent]
  );

  const currentAngle = showcaseAngles[activeAngleIndex];
  const accentEntries = Object.entries(FOOTWEAR_DESIGN_TOKENS.accentSwatches) as Array<[AccentSwatchName, number]>;

  return (
    <StorefrontTiltCard className="w-full max-w-md bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] backdrop-blur-xl p-6 rounded-3xl shadow-xl space-y-4">
      {/* Real Three.js interactive 3D canvas */}
      <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-inner">
        <ThreeJuttiHeroCanvas
          className="!aspect-auto !w-full !h-full"
          aspectRatio={4 / 3}
          accent={currentAngle.accent}
          compact
        />
        <span className="absolute top-3 left-3 z-10 px-3 py-1 bg-[#12080C]/90 backdrop-blur-md text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#D4AF37]/30 flex items-center gap-1.5 shadow">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          Live 3D Showcase
        </span>
      </div>

      {/* Accent colour swatches */}
      <div role="radiogroup" aria-label="Body accent colour" className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-color-text-muted)] mr-1">
          Velvet
        </span>
        {accentEntries.map(([name, hex]) => {
          const isActive = name === activeAccent;
          return (
            <button
              key={name}
              role="radio"
              aria-checked={isActive}
              aria-label={`${name} velvet body`}
              onClick={() => setActiveAccent(name)}
              className={`w-7 h-7 rounded-full transition-all shadow-md border-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/70 ${
                isActive ? 'border-[var(--theme-color-accent)] scale-110' : 'border-[var(--theme-color-border)]'
              }`}
              style={{ backgroundColor: `#${hex.toString(16).padStart(6, '0')}` }}
            />
          );
        })}
      </div>

      {/* Angle Selector Tabs */}
      <div className="flex gap-2" role="tablist" aria-label="Showcase perspective">
        {showcaseAngles.map((angle, idx) => (
          <button
            key={angle.id}
            role="tab"
            aria-selected={activeAngleIndex === idx}
            onClick={() => setActiveAngleIndex(idx)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 ${
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
        <h3 className="font-serif text-lg font-bold capitalize text-[var(--theme-color-text)]">
          {activeAccent} Velvet & Zari Gold
        </h3>
        <p className="text-xs text-[var(--theme-color-text-muted)] leading-relaxed">{currentAngle.desc}</p>
      </div>
    </StorefrontTiltCard>
  );
}
