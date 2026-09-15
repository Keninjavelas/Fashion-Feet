"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { StorefrontTiltCard } from "../storefront/StorefrontTiltCard";
import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";

export function FeaturedCollections({
  collectionWedding,
  collectionFestive,
  collectionCasual
}: {
  collectionWedding?: string;
  collectionFestive?: string;
  collectionCasual?: string;
}) {
  const collections = [
    {
      title: "Wedding Collection",
      subtitle: "Bridal Zari & Dabka Grandeur",
      desc: "Royal crimson silk velvet juttis stitched thread-by-thread with gold zari yarn for wedding ceremonies.",
      image: collectionWedding || PLACEHOLDER_HOMEPAGE_IMAGE,
      href: "/shop?category=Wedding",
      tag: "Bridal Couture"
    },
    {
      title: "Festive Collection",
      subtitle: "Sequin, Pearl & Silver Sparkle",
      desc: "Vibrant festive pairs designed for Diwali, Eid, and Anand Karaj celebrations.",
      image: collectionFestive || PLACEHOLDER_HOMEPAGE_IMAGE,
      href: "/shop?category=Festive",
      tag: "Festive Season"
    },
    {
      title: "Everyday Luxury Mojaris",
      subtitle: "Supple Leather & Memory Insoles",
      desc: "Chrome-free genuine leather slip-ons with double velvet arch padding for daily ease.",
      image: collectionCasual || PLACEHOLDER_HOMEPAGE_IMAGE,
      href: "/shop?category=Casual",
      tag: "Everyday Comfort"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-color-surface)] text-[var(--theme-color-accent)] rounded-full text-xs uppercase tracking-widest font-bold border border-[var(--theme-color-border)] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Heritage Collections</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[var(--theme-color-text)]">
            Explore Handcrafted Styles
          </h2>
          <p className="text-[var(--theme-color-text-muted)] text-sm md:text-base font-light">
            Each collection is thoughtfully designed around authentic Punjabi embroidery techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col) => (
            <StorefrontTiltCard key={col.title} className="bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group flex flex-col justify-between">
              <div className="relative h-72 sm:h-80 overflow-hidden bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{col.tag}</span>
                  <h3 className="font-serif text-2xl font-bold">{col.title}</h3>
                  <p className="text-xs text-white/80 font-light mt-1">{col.subtitle}</p>
                </div>
              </div>

              <div className="p-6 space-y-4 text-left border-t border-[var(--theme-color-border)] bg-[var(--theme-color-surface)]">
                <p className="text-xs text-[var(--theme-color-text-muted)] leading-relaxed font-light">
                  {col.desc}
                </p>
                <Link
                  href={col.href}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--theme-color-jewel)] hover:underline pt-1"
                >
                  Discover Collection <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </StorefrontTiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
