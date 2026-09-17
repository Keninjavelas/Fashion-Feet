"use client";

import { Sparkles, Compass, ShieldCheck, Award } from "lucide-react";
import Link from "next/link";
import { StorefrontTiltCard } from "../storefront/StorefrontTiltCard";
import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";

export function HeritageArtistrySection({
  artisanImage1,
  artisanImage2
}: {
  artisanImage1?: string;
  artisanImage2?: string;
}) {
  const img1 = artisanImage1 || PLACEHOLDER_HOMEPAGE_IMAGE;
  const img2 = artisanImage2 || PLACEHOLDER_HOMEPAGE_IMAGE;

  return (
    <section className="py-24 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Narrative Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--theme-color-surface)] text-[var(--theme-color-accent)] text-xs uppercase tracking-widest font-semibold border border-[var(--theme-color-border)] rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-[var(--theme-color-accent)]" />
              <span>Handcrafted in the Punjabi Tradition</span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-[var(--theme-color-text)]">
              Preserving the Royal Art of <span className="text-[var(--theme-color-accent)]">Zari & Dabka</span>
            </h2>

            <p className="text-[var(--theme-color-text-muted)] text-base md:text-lg leading-relaxed font-sans font-light">
              Unlike mass-manufactured shoes, every pair of Fashion Feet Juttis is crafted by hand by Punjabi artisans using vegetable-tanned leather, silk velvet, and metallic threadwork.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--theme-color-border)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[var(--theme-color-accent)] font-bold text-sm">
                  <Award className="w-4 h-4" /> 100% Handcrafted
                </div>
                <p className="text-xs text-[var(--theme-color-text-muted)]">Stitched thread-by-thread without harsh synthetic glues.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[var(--theme-color-accent)] font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" /> Cushioned Comfort
                </div>
                <p className="text-xs text-[var(--theme-color-text-muted)]">Velvet arch cushioning for day-long royal comfort.</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] font-bold text-xs uppercase tracking-widest rounded-xl hover:border-[var(--theme-color-accent)] transition-all border border-[var(--theme-color-border)] shadow-sm"
              >
                Read Full Heritage Story <Compass className="w-4 h-4 text-[var(--theme-color-accent)]" />
              </Link>
            </div>
          </div>

          {/* Right Editorial Image Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <StorefrontTiltCard className="bg-[var(--theme-color-surface)] rounded-2xl overflow-hidden border border-[var(--theme-color-border)] h-64 sm:h-80 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img1}
                alt="Zari Embroidery Artisan"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent p-4 flex flex-col justify-end">
                <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">Hand Embroidery</span>
                <p className="font-serif text-sm font-bold text-white">Artisanal Zari Stitching</p>
              </div>
            </StorefrontTiltCard>

            <StorefrontTiltCard className="bg-[var(--theme-color-surface)] rounded-2xl overflow-hidden border border-[var(--theme-color-border)] h-64 sm:h-80 shadow-lg mt-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img2}
                alt="Genuine Leather Moulding"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent p-4 flex flex-col justify-end">
                <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">Anatomical Fit</span>
                <p className="font-serif text-sm font-bold text-white">Vegetable Leather Sole</p>
              </div>
            </StorefrontTiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
