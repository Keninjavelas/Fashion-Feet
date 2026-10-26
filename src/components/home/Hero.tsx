"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import { SwayingSilkHeroBackground } from "./SwayingSilkHeroBackground";
import { ThreeJuttiHeroCanvas } from "../three/ThreeJuttiHeroCanvas";
import { useFestival } from "@/components/providers/FestivalProvider";
import { BRAND_TAGLINE } from "@/lib/branding";
import { BrandLogo } from "@/components/layout/BrandLogo";
import type { StorefrontSection } from "@/lib/storefrontConfigTypes";
import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";

export function Hero({ section, fallbackImage }: { section?: StorefrontSection; fallbackImage?: string }) {
  const { activeFestival } = useFestival();
  const isDiwali = activeFestival === "diwali" || activeFestival === "baisakhi" || activeFestival === "lohri";
  const isDark = isDiwali || section?.stylePreset === "DARK_ROYAL";
  const heroImage = section?.image && section.image !== PLACEHOLDER_HOMEPAGE_IMAGE ? section.image : fallbackImage || null;

  return (
    <section className={`relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-28 pb-20 transition-colors duration-500 ${
      isDark ? "bg-[#12080C] text-white" : "bg-gradient-to-b from-[#FAF6F0] via-[#F5F0E8] to-[#FAF6F0] text-[#1F1A17]"
    }`}>
      {heroImage && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#12080C]/80 via-[#12080C]/30 to-transparent" />
        </div>
      )}
      {/* Swaying Silk Displacement Background (Only renders when Diwali mode is active) */}
      <SwayingSilkHeroBackground />

      {/* Evergreen Light Mode Ambient Aura Glow */}
      {!isDark && !heroImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[#C5A059]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-[#8A1538]/5 rounded-full blur-3xl" />
        </div>
      )}

      <div className="container mx-auto px-4 md:px-8 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Typography Column */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold shadow-sm border ${
              isDark
                ? "bg-white/10 text-[#D4AF37] border-[#D4AF37]/30 backdrop-blur-md" 
                : "bg-[#8A1538]/10 text-[#8A1538] border-[#8A1538]/20"
            }`}>
              <Sparkles className="w-4 h-4 text-[#8A1538]" />
              <span>{section?.badge || "Handcrafted Heritage • Punjabi Footwear"}</span>
            </div>

            <BrandLogo className="mx-auto h-36 w-auto rounded-xl border border-[var(--theme-color-border)] bg-white shadow-lg lg:mx-0 lg:h-44" sizes="(max-width: 1024px) 200px, 240px" eager />

            <p className="font-serif text-lg font-bold text-[#D4AF37]">{BRAND_TAGLINE}</p>
            <h1 className={`font-serif text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl ${isDark ? "text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F6F2EB] to-[#D4AF37]" : "text-transparent bg-clip-text bg-gradient-to-r from-[#8A1538] via-[#C5A059] to-[#8A1538]"}`}>
              {section?.title || "Timeless Elegance in Every Step"}
            </h1>
          </div>

          <p className={`text-base sm:text-xl font-sans max-w-xl mx-auto lg:mx-0 leading-relaxed font-light ${
            isDark ? "text-[#F6F2EB]/90" : "text-[#1F1A17]/80"
          }`}>
            {section?.subtitle || "Step into Punjabi footwear artistry. Crafted from genuine leather, gold zari threadwork, and double velvet arch comfort."}
          </p>

          {section?.description && <p className={`mx-auto max-w-xl text-sm lg:mx-0 ${isDark ? "text-white/70" : "text-[#1F1A17]/70"}`}>{section.description}</p>}

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href={section?.ctaLink || "/shop"}
              className="w-full sm:w-auto px-8 py-4 bg-[#8A1538] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#A81B45] transition-all duration-300 rounded-xl shadow-xl flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              {section?.ctaText || "Explore Showroom"} <ArrowRight className="w-4 h-4 text-[#C5A059]" />
            </Link>
            <Link
              href="/stores"
              className={`w-full sm:w-auto px-8 py-4 font-bold uppercase tracking-widest text-xs transition-all duration-300 rounded-xl border flex items-center justify-center gap-2 ${
                isDark ? "bg-white/10 text-white border-white/15 hover:bg-white/20" : "bg-white text-[#1F1A17] border-black/10 hover:border-black/30 shadow-sm"
              }`}
            >
              <Compass className="w-4 h-4 text-[#C5A059]" /> Experience Stores
            </Link>
          </div>
        </div>

        {/* Right High-Res Real 3D Jutti Hero Canvas */}
        <div className="lg:col-span-5 flex justify-center">
          <ThreeJuttiHeroCanvas aspectRatio={4 / 3} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-gray-400">
        <span className="text-[10px] uppercase tracking-widest mb-1.5 font-bold text-[#C5A059]">Scroll to explore</span>
        <div className="w-px h-10 bg-gradient-to-b from-[#C5A059] to-transparent animate-pulse" />
      </div>
    </section>
  );
}
