"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Maximize2, Sparkles } from "lucide-react";
import { useState } from "react";
import { QuickViewModal } from "@/components/ui/QuickViewModal";
import { toggleWishlist } from "@/app/actions/wishlist";
import { StorefrontTiltCard } from "../storefront/StorefrontTiltCard";
import { useFestival } from "@/components/providers/FestivalProvider";
import type { StorefrontSection } from "@/lib/storefrontConfigTypes";
import { ThreeJuttiCompactCard } from "@/components/three/ThreeJuttiCompactCard";
import {
  FOOTWEAR_DESIGN_TOKENS,
  type AccentSwatchName
} from "@/components/three/ProceduralPunjabiJutti";

const ACCENT_POOL: AccentSwatchName[] = Object.keys(
  FOOTWEAR_DESIGN_TOKENS.accentSwatches
) as AccentSwatchName[];

export function TrendingProductsClient({ products, section }: { products: any[]; section?: StorefrontSection }) {
  const { preset } = useFestival();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-color-surface)] text-[var(--theme-color-accent)] rounded-full text-xs uppercase tracking-widest font-bold border border-[var(--theme-color-border)] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{section?.badge || "Masterpiece Gallery"}</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--theme-color-text)]">
            {section?.title || "Trending Designs"}
          </h2>
          <p className="text-[var(--theme-color-text-muted)] max-w-xl mx-auto text-sm md:text-base font-light">
            {section?.subtitle || preset.decorations.heroSubheadline || "Our most requested handcrafted Punjabi Juttis, selected for unmatched elegance and comfort."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              cardBadge={preset.decorations.cardBadge}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  index,
  cardBadge
}: {
  product: any;
  index: number;
  cardBadge?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const accentSwatch = ACCENT_POOL[index % ACCENT_POOL.length];

  return (
    <>
      <StorefrontTiltCard className="bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group flex flex-col justify-between">
        <div
          className="relative aspect-[4/5] bg-black/5 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0">
            <ThreeJuttiCompactCard
              className="!rounded-none !border-0 h-full w-full"
              accent={accentSwatch}
              aspectRatio={4 / 5}
              interactive="hover-rotate"
              spinSpeed={0.016}
              tiltStrength={0.4}
              label={product.title}
            />
          </div>
          {(product.images && product.images.length > 0) && (
            <div
              className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
                isHovered ? "opacity-0" : "opacity-100"
              }`}
            >
              <Image
                src={product.images[0].url}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover mix-blend-multiply opacity-70"
              />
            </div>
          )}
          {(!product.images || product.images.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none opacity-0 group-hover:opacity-0">
              <span className="font-serif text-[var(--theme-color-accent)] opacity-50 text-2xl rotate-45 transform">
                JUTTI
              </span>
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {cardBadge && (
              <span className="bg-[var(--theme-color-accent)] text-slate-900 text-[9px] font-bold px-2.5 py-0.5 uppercase tracking-widest rounded-full shadow-md">
                {cardBadge}
              </span>
            )}

            {product.discount > 0 && (
              <span className="bg-[var(--theme-color-jewel)] text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest rounded shadow">
                {product.discount}% Off
              </span>
            )}
          </div>

          <button
            onClick={async (e) => {
              e.preventDefault();
              const prev = isWishlisted;
              setIsWishlisted(!isWishlisted);
              try {
                const res = await toggleWishlist(product.id);
                if (res?.error) {
                  setIsWishlisted(prev);
                  alert(res.error);
                }
              } catch (err) {
                setIsWishlisted(prev);
              }
            }}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] hover:text-[var(--theme-color-accent)] transition-all shadow-md border border-[var(--theme-color-border)]"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-3.5 rounded-full bg-[var(--theme-color-surface)] shadow-xl text-[var(--theme-color-text)] hover:text-[var(--theme-color-accent)] transition-all duration-300 transform ${
              isHovered ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
            aria-label="Quick view"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-1 text-left bg-[var(--theme-color-surface)] border-t border-[var(--theme-color-border)]">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--theme-color-accent)]">{product.category}</span>
          <h3 className="font-serif text-base font-bold text-[var(--theme-color-text)] truncate group-hover:text-[var(--theme-color-accent)] transition-colors">
            <Link href={`/product/${product.id}`}>{product.title}</Link>
          </h3>
          <div className="flex items-center gap-2 pt-1 font-mono">
            <span className="font-bold text-sm text-[var(--theme-color-text)]">₹{product.price.toLocaleString('en-IN')}</span>
            {product.discount > 0 && (
              <span className="text-xs text-[var(--theme-color-text-muted)] line-through">₹{Math.round(product.price * (1 + product.discount/100)).toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </StorefrontTiltCard>
      <QuickViewModal product={product} isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}

