"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Maximize2 } from "lucide-react";
import { useState } from "react";
import { QuickViewModal } from "@/components/ui/QuickViewModal";
import { toggleWishlist } from "@/app/actions/wishlist";
import type { StorefrontSection } from "@/lib/storefrontConfigTypes";

export function TrendingProductsClient({ products, section }: { products: any[]; section?: StorefrontSection }) {

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--theme-color-accent)]">{section?.badge || "From the catalogue"}</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--theme-color-text)]">
            {section?.title || "Trending Designs"}
          </h2>
          <p className="text-[var(--theme-color-text-muted)] max-w-xl mx-auto text-sm md:text-base font-light">
            {section?.subtitle || "Explore published Fashion Feet designs and enquire about the pair that catches your eye."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: any }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  return (
    <>
      <article className="group flex flex-col justify-between overflow-hidden border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#eee7de]">
          {(product.images && product.images.length > 0) && (
              <Image
                src={product.images[0].url}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
              />
          )}
          {(!product.images || product.images.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center font-serif text-xl text-[#6d5a50]">Product photography coming soon</div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
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
            className="absolute bottom-3 right-3 z-10 inline-flex min-h-11 items-center gap-2 bg-[var(--theme-color-surface)] px-3 text-xs font-semibold text-[var(--theme-color-text)] shadow-md hover:text-[var(--theme-color-jewel)]"
            aria-label="Quick view"
          >
            <Maximize2 className="w-4 h-4" /> Quick view
          </button>
        </div>

        <div className="p-4 space-y-1 text-left bg-[var(--theme-color-surface)] border-t border-[var(--theme-color-border)]">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--theme-color-accent)]">{product.category}</span>
          <h3 className="font-serif text-base font-bold text-[var(--theme-color-text)] truncate group-hover:text-[var(--theme-color-accent)] transition-colors">
            <Link href={`/product/${product.id}`}>{product.title}</Link>
          </h3>
          <div className="flex items-center gap-2 pt-1 font-mono">
            <span className="font-bold text-sm text-[var(--theme-color-text)]">₹{Math.round(product.price * (1 - (product.discount || 0) / 100)).toLocaleString('en-IN')}</span>
            {product.discount > 0 && (
              <span className="text-xs text-[var(--theme-color-text-muted)] line-through">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </article>
      <QuickViewModal product={product} isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}

