"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { useFestival } from "@/components/providers/FestivalProvider";

export function CollectionsMegaMenu({ categories, collections, onClose }: { categories: { name: string; description: string | null }[]; collections: { id: string; title: string; description: string | null }[]; onClose: () => void }) {
  const { activeFestival, preset } = useFestival();
  const isFestiveActive = activeFestival !== "none" && activeFestival !== "default";
  const menuItems = [
    ...collections.map((collection) => ({ key: `collection-${collection.id}`, name: collection.title, description: collection.description, href: `/shop?collection=${encodeURIComponent(collection.id)}` })),
    ...categories.map((category) => ({ key: `category-${category.name}`, name: category.name, description: category.description, href: `/shop?category=${encodeURIComponent(category.name)}` })),
  ];

  return (
    <div className="absolute top-full left-0 w-full bg-[var(--theme-color-surface)] border-b border-[var(--theme-color-border)] shadow-2xl z-50 transition-all duration-300 py-8 text-[var(--theme-color-text)]">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Primary Occasions List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--theme-color-border)] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-color-accent)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Curated Occasion Collections
              </span>
              <Link href="/shop" onClick={onClose} className="text-[11px] font-bold uppercase tracking-widest text-[var(--theme-color-jewel)] hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {menuItems.map((col) => (
                <Link
                  key={col.key}
                  href={col.href}
                  onClick={onClose}
                  className="p-3.5 rounded-2xl bg-[var(--theme-color-bg)] border border-[var(--theme-color-border)] hover:border-[var(--theme-color-accent)] transition-all hover:-translate-y-0.5 group space-y-1 block shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[var(--theme-color-text)] group-hover:text-[var(--theme-color-accent)] transition-colors">
                      {col.name}
                    </h4>
                      <ArrowRight className="h-3 w-3 text-[var(--theme-color-accent)]" />
                  </div>
                  {col.description && <p className="text-xs text-[var(--theme-color-text-muted)] font-light leading-snug">{col.description}</p>}
                </Link>
              ))}
              {menuItems.length === 0 && <Link href="/shop" onClick={onClose} className="rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-bg)] p-4 text-sm text-[var(--theme-color-text)]">Browse all products</Link>}
            </div>
          </div>

          {/* Right Column: Active Campaign & Quick Links */}
          <div className="lg:col-span-5 bg-[var(--theme-color-bg)] p-6 rounded-2xl border border-[var(--theme-color-border)] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--theme-color-border)] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-color-accent)]">
                {isFestiveActive ? `✨ ${preset.name}` : "🏆 Heritage Showcase"}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Handcrafted
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-[var(--theme-color-text)]">
                {preset.name}
              </h3>
              <p className="text-xs text-[var(--theme-color-text-muted)] leading-relaxed font-light">
                {preset.decorations.announcementMessages[0] || "Step into Punjabi footwear artistry."}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/shop?type=new"
                onClick={onClose}
                className="flex-1 py-3 bg-[var(--theme-color-jewel)] text-white text-[11px] font-bold uppercase tracking-widest text-center rounded-xl hover:opacity-90 transition-all shadow"
              >
                New Arrivals
              </Link>
              <Link
                href="/size-guide"
                onClick={onClose}
                className="flex-1 py-3 bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] text-[11px] font-bold uppercase tracking-widest text-center rounded-xl border border-[var(--theme-color-border)] hover:border-[var(--theme-color-accent)] transition-all"
              >
                Size Studio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
