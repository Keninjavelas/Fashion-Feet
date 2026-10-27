"use client";

import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { Filter, ChevronDown, Heart, Sparkles } from "lucide-react";
import Image from "next/image";
import { toggleWishlist } from "@/app/actions/wishlist";
import { StorefrontTiltCard } from "@/components/storefront/StorefrontTiltCard";
import type { StorefrontSection } from "@/lib/storefrontConfigTypes";
import { CATALOGUES, catalogueHref } from "@/lib/catalogues";

interface CollectionPageProps {
  title: string;
  description: string;
  products: any[];
  section?: StorefrontSection;
  hideHero?: boolean;
  gender?: "Men" | "Women";
  emptyContent?: ReactNode;
}

type SortOption = "newest" | "price_asc" | "price_desc" | "popular";

export function CollectionPage({ title, description, products, section, hideHero = false, gender, emptyContent }: CollectionPageProps) {
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort() as string[];
  const maxProductPrice = Math.max(5000, Math.ceil(Math.max(...products.map((product) => Number(product.price) || 0), 0) / 500) * 500);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxProductPrice]);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Distinguishes "the visitor narrowed the results away" from "there is
  // nothing published yet", which need different, honest empty states.
  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < maxProductPrice;
  
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }
    
    result = result.filter(p => {
      const finalPrice = p.discount ? p.price * (1 - p.discount/100) : p.price;
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    });
    
    switch (sortOption) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case "newest":
      default:
        break;
    }
    
    return result;
  }, [products, selectedCategories, priceRange, sortOption]);

  return (
    <div data-published-section="HERO_BANNER" data-style-preset={section?.stylePreset || "DARK_ROYAL"} data-motion-preset={section?.motionPreset || "NONE"} className="pt-24 pb-16 min-h-screen bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] transition-colors duration-300">
      {/* Header */}
      {!hideHero && <div className="bg-[var(--theme-color-surface)] py-16 mb-12 border-b border-[var(--theme-color-border)] relative overflow-hidden shadow-sm">
        {section?.image && <div className="absolute inset-0 opacity-15"><Image src={section.image} alt="" fill className="object-cover" /></div>}
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-color-bg)] text-[var(--theme-color-accent)] rounded-full text-xs uppercase tracking-widest font-bold border border-[var(--theme-color-border)] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{section?.badge || "Heritage Collection"}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-[var(--theme-color-text)] tracking-tight font-bold">
            {section?.title || title}
          </h1>
          <p className="text-base md:text-lg text-[var(--theme-color-text-muted)] max-w-2xl mx-auto font-light leading-relaxed">
            {section?.subtitle || description}
          </p>
          {section?.description && <p className="mx-auto max-w-2xl text-sm text-[var(--theme-color-text-muted)]">{section.description}</p>}
          {section?.ctaText && <Link href={section.ctaLink || "/shop"} className="inline-flex rounded-xl bg-[#8A1538] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white">{section.ctaText}</Link>}
        </div>
      </div>}

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {gender && <nav aria-label={`${gender}'s catalogues`} className="mb-8 flex flex-wrap gap-3">
          {CATALOGUES.map((catalogue) => <Link key={catalogue.slug} href={catalogueHref(catalogue.slug, gender)} className="rounded-full border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-[var(--theme-color-text)] hover:border-[var(--theme-color-accent)]">{catalogue.name}</Link>)}
        </nav>}
        {/* Top Bar: Filter Toggle and Sort */}
        {!(products.length === 0 && emptyContent) && <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-[var(--theme-color-border)] pb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-[var(--theme-color-text)] font-bold uppercase tracking-widest text-xs hover:text-[var(--theme-color-accent)] transition-colors"
          >
            <Filter className="w-4 h-4 mr-2 text-[var(--theme-color-accent)]" />
            Filters {showFilters ? "(-)" : "(+)"}
          </button>
          
          <div className="flex items-center mt-4 sm:mt-0">
            <span className="text-xs text-[var(--theme-color-text-muted)] mr-4 font-bold">
              {filteredProducts.length === 1 ? '1 Product' : `${filteredProducts.length} Products`}
            </span>
            <div className="flex items-center gap-2 relative">
              <span className="text-xs text-[var(--theme-color-text-muted)] hidden sm:inline uppercase tracking-widest">Sort by:</span>
              <select 
                className="appearance-none bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] border border-[var(--theme-color-border)] rounded-lg px-4 py-2 text-xs font-bold focus:outline-none focus:border-[var(--theme-color-accent)] cursor-pointer shadow-sm"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 pointer-events-none text-[var(--theme-color-text-muted)]" />
            </div>
          </div>
        </div>}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          {showFilters && products.length > 0 && (
            <aside className="w-full lg:w-[250px] space-y-8 pr-4 border-r border-[var(--theme-color-border)] lg:shrink-0">
              <div>
                <h3 className="font-serif text-lg font-bold mb-4 text-[var(--theme-color-accent)]">Category</h3>
                <ul className="space-y-3 text-xs text-[var(--theme-color-text-muted)]">
                  {categories.map(cat => (
                    <li key={cat} className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-3 accent-[var(--theme-color-jewel)]" 
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      /> 
                      {cat}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold mb-4 text-[var(--theme-color-accent)]">Price Limit</h3>
                <div className="flex justify-between items-center mb-2 text-xs text-[var(--theme-color-text-muted)] font-mono">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
                  <input
                  type="range" 
                  min="0" max={maxProductPrice} step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-[var(--theme-color-jewel)]"
                  aria-label="Max price"
                />
              </div>
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              hasActiveFilters ? (
                <div className="text-center py-24 bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] shadow-md rounded-2xl flex flex-col items-center p-8">
                  <Filter className="w-12 h-12 text-[var(--theme-color-accent)]/40 mb-4" />
                  <h2 className="font-serif text-2xl text-[var(--theme-color-text)] mb-2 font-bold">No products match your filters</h2>
                  <p className="text-[var(--theme-color-text-muted)] text-xs mb-6">Try adjusting your filters or clearing them to explore our collection.</p>
                  <button 
                    onClick={() => { setSelectedCategories([]); setPriceRange([0, maxProductPrice]); }}
                    className="px-6 py-3 bg-[var(--theme-color-jewel)] text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-colors rounded-xl border border-[var(--theme-color-border)] shadow-md"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : emptyContent ? (
                emptyContent
              ) : (
                <div className="text-center py-24 bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] shadow-md rounded-2xl flex flex-col items-center p-8">
                  <Sparkles className="w-12 h-12 text-[var(--theme-color-accent)]/40 mb-4" />
                  <h2 className="font-serif text-2xl text-[var(--theme-color-text)] mb-2 font-bold">Our catalogue is being updated</h2>
                  <p className="text-[var(--theme-color-text-muted)] text-xs">No products are available to display right now.</p>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <StorefrontTiltCard className="bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group flex flex-col justify-between">
      <div 
        className="relative aspect-[4/5] bg-black/5 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {product.images && product.images.length > 0 ? (
          <Image 
            src={product.images[0].url} 
            alt={product.title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
             <span className="font-serif text-[var(--theme-color-accent)] opacity-50 text-2xl rotate-45 transform">JUTTI</span>
          </div>
        )}
        
        {(product.discount ?? 0) > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-[var(--theme-color-jewel)] text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest rounded shadow">
              {product.discount}% Off
            </span>
          </div>
        )}

        <button 
          onClick={async (e) => { 
            e.preventDefault(); 
            const prev = isWishlisted;
            setIsWishlisted(!isWishlisted); 
            try {
              const res = await toggleWishlist(product.id);
              if (res.error) {
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
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>

        <div className={`absolute bottom-0 left-0 w-full p-4 transform transition-transform duration-300 ease-in-out ${isHovered ? "translate-y-0" : "translate-y-full"}`}>
          <Link href={`/product/${product.id}`} className="block w-full py-3 bg-[var(--theme-color-jewel)] text-white text-center font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-colors rounded-xl shadow-lg border border-[var(--theme-color-border)]">
            View Details
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-1 text-left border-t border-[var(--theme-color-border)] bg-[var(--theme-color-surface)]">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--theme-color-accent)]">{product.category}</span>
        <h3 className="font-serif text-base font-bold text-[var(--theme-color-text)] truncate group-hover:text-[var(--theme-color-accent)] transition-colors">
          <Link href={`/product/${product.id}`}>{product.title}</Link>
        </h3>
        <div className="flex items-center gap-2 pt-1 font-mono">
          <span className="font-bold text-sm text-[var(--theme-color-text)]">₹{product.price.toLocaleString('en-IN')}</span>
          {(product.discount ?? 0) > 0 && (
            <span className="text-xs text-[var(--theme-color-text-muted)] line-through">₹{Math.round(product.price * (1 + product.discount/100)).toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </StorefrontTiltCard>
  );
}
