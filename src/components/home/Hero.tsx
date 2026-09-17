"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import { SwayingSilkHeroBackground } from "./SwayingSilkHeroBackground";
import { Real3DJuttiHeroCanvas } from "./Real3DJuttiHeroCanvas";
import { useFestival } from "@/components/providers/FestivalProvider";

export function Hero({ 
  heroImage, 
  artisanImage1, 
  artisanImage2 
}: { 
  heroImage?: string; 
  artisanImage1?: string; 
  artisanImage2?: string; 
}) {
  const { activeFestival } = useFestival();
  const isDiwali = activeFestival === "diwali" || activeFestival === "baisakhi" || activeFestival === "lohri";

  return (
    <section className={`relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-28 pb-20 transition-colors duration-500 ${
      isDiwali ? "bg-[#12080C] text-white" : "bg-gradient-to-b from-[#FAF6F0] via-[#F5F0E8] to-[#FAF6F0] text-[#1F1A17]"
    }`}>
      {/* Swaying Silk Displacement Background (Only renders when Diwali mode is active) */}
      <SwayingSilkHeroBackground />

      {/* Evergreen Light Mode Ambient Aura Glow */}
      {!isDiwali && (
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
              isDiwali 
                ? "bg-white/10 text-[#D4AF37] border-[#D4AF37]/30 backdrop-blur-md" 
                : "bg-[#8A1538]/10 text-[#8A1538] border-[#8A1538]/20"
            }`}>
              <Sparkles className="w-4 h-4 text-[#8A1538]" />
              <span>Handcrafted Heritage • Punjabi Footwear</span>
            </div>

            <h1 className={`font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-none ${
              isDiwali ? "text-white" : "text-[#1F1A17]"
            }`}>
              Royal Elegance.<br />
              <span className={isDiwali ? "text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F6F2EB] to-[#D4AF37]" : "text-transparent bg-clip-text bg-gradient-to-r from-[#8A1538] via-[#C5A059] to-[#8A1538]"}>
                Handcrafted Precision.
              </span>
            </h1>
          </div>

          <p className={`text-base sm:text-xl font-sans max-w-xl mx-auto lg:mx-0 leading-relaxed font-light ${
            isDiwali ? "text-[#F6F2EB]/90" : "text-[#1F1A17]/80"
          }`}>
            Step into Punjabi footwear artistry. Crafted from genuine leather, gold zari threadwork, and double velvet arch comfort.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-[#8A1538] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#A81B45] transition-all duration-300 rounded-xl shadow-xl flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              Explore Showroom <ArrowRight className="w-4 h-4 text-[#C5A059]" />
            </Link>
            <Link
              href="/stores"
              className={`w-full sm:w-auto px-8 py-4 font-bold uppercase tracking-widest text-xs transition-all duration-300 rounded-xl border flex items-center justify-center gap-2 ${
                isDiwali ? "bg-white/10 text-white border-white/15 hover:bg-white/20" : "bg-white text-[#1F1A17] border-black/10 hover:border-black/30 shadow-sm"
              }`}
            >
              <Compass className="w-4 h-4 text-[#C5A059]" /> Experience Stores
            </Link>
          </div>
        </div>

        {/* Right High-Res Real 3D Jutti Hero Canvas */}
        <div className="lg:col-span-5 flex justify-center">
          <Real3DJuttiHeroCanvas fallbackImage={heroImage} />
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
