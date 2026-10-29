"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Filter, X, ChevronDown, Heart } from "lucide-react";
import { QuickViewModal } from "@/components/ui/QuickViewModal";
import { toggleWishlist } from "@/app/actions/wishlist";
import { StorefrontTiltCard } from "@/components/storefront/StorefrontTiltCard";

type SortOption = "newest" | "price_asc" | "price_desc" | "popular";
function FilterSidebar({ activeFilterCount, clearFilters, colors, selectedColors, toggleColor, priceRange, maxProductPrice, setPriceRange }: { activeFilterCount: number; clearFilters: () => void; colors: { name: string; value: string }[]; selectedColors: string[]; toggleColor: (color: string) => void; priceRange: [number, number]; maxProductPrice: number; setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>; }) {
  return (
    <div className="space-y-8 text-[var(--theme-color-text)]">
      <div className="flex items-center justify-between border-b border-[var(--theme-color-border)] pb-4">
        <h3 className="font-serif text-lg font-bold flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--theme-color-jewel)]" /> Filter Collection
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="space-y-4">
        <h4 className="font-sans font-bold uppercase tracking-widest text-xs">Color Palette</h4>
        <div className="flex flex-wrap gap-3">
          {colors.map(color => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-105 ${selectedColors.includes(color.name) ? "border-[var(--theme-color-jewel)] scale-105" : "border-[var(--theme-color-border)]"}`}
              style={{ backgroundColor: color.value }}
              title={color.name}
              aria-label={`Filter by ${color.name}`}
            />
          ))}
        </div>
      </div>
      <div className="space-y-4 border-t border-[var(--theme-color-border)] pt-6">
        <div className="flex justify-between items-center text-xs">
          <h4 className="font-sans font-bold uppercase tracking-widest">Max Price</h4>
          <span className="font-mono font-bold">₹{priceRange[1]}</span>
        </div>
        <input
          type="range"
          min="0"
          max={maxProductPrice}
          step="500"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
          className="w-full accent-[#8A1538]"
          aria-label="Max price"
        />
      </div>
    </div>
  );
}

export function ShopClient({ initialProducts, initialCategory }: { initialProducts: any[], initialCategory?: string }) {
  const products = initialProducts;
  const maxProductPrice = Math.max(15000, Math.ceil(Math.max(...products.map((product) => Number(product.price) || 0), 0) / 500) * 500);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxProductPrice]);
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const colors = [...new Set(products.flatMap((product) => String(product.colors || "").split(",").map((color) => color.trim()).filter(Boolean)))].sort().map((name) => {
    const lower = name.toLowerCase();
    const value = lower.includes("gold") ? "#D4AF37" : lower.includes("red") || lower.includes("crimson") ? "#8A1538" : lower.includes("black") ? "#171717" : lower.includes("brown") ? "#78350f" : lower.includes("blue") ? "#2563eb" : lower.includes("green") ? "#15803d" : "#8b6f72";
    return { name, value };
  });

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setPriceRange([0, maxProductPrice]);
  };

  const activeFilterCount = selectedColors.length + (priceRange[0] > 0 || priceRange[1] < maxProductPrice ? 1 : 0);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    result = result.filter(p => {
      const finalPrice = p.discount ? p.price * (1 - p.discount/100) : p.price;
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    });

    if (selectedColors.length > 0) {
      result = result.filter(p => {
        const productColors = String(p.colors || "").split(",").map((color) => color.trim().toLowerCase());
        return selectedColors.some(color => productColors.includes(color.toLowerCase()));
      });
    }

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
  }, [products, selectedColors, priceRange, sortOption]);



  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mt-8 text-[var(--theme-color-text)]">
      {/* Desktop Sidebar */}
      {products.length > 0 && <aside className="hidden md:block w-64 flex-shrink-0 sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto pr-4">
        <FilterSidebar
          activeFilterCount={activeFilterCount}
          clearFilters={clearFilters}
          colors={colors}
          selectedColors={selectedColors}
          toggleColor={toggleColor}
          priceRange={priceRange}
          maxProductPrice={maxProductPrice}
          setPriceRange={setPriceRange}
        />
      </aside>}

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {products.length > 0 && <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--theme-color-border)] pb-4">
          <div className="flex items-center gap-2">
            <button 
              className="md:hidden flex items-center gap-2 px-4 py-2 border border-[var(--theme-color-border)] text-sm font-semibold"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <Filter className="w-4 h-4 text-[#D4AF37]" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>
            {products.length > 0 && (
              <p className="text-sm text-[var(--theme-color-text-muted)] hidden sm:block">
                Showing <span className="font-bold text-[var(--theme-color-text)]">{filteredProducts.length}</span> footwear pairs
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 relative">
            <span className="text-sm text-[var(--theme-color-text-muted)] font-semibold">Sort by:</span>
            <select 
              aria-label="Sort products"
              className="appearance-none bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] px-3 py-2.5 pr-8 text-sm font-semibold cursor-pointer"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--theme-color-text-muted)]" />
          </div>
        </div>}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          activeFilterCount > 0 ? (
            <div className="text-center py-20 bg-[#1C1412] border border-white/10 shadow-xl rounded-2xl flex flex-col items-center p-6 space-y-3">
              <Filter className="w-12 h-12 text-[#D4AF37]/40 mb-2" />
              <h3 className="font-serif text-xl font-bold text-white">No products found</h3>
              <p className="text-xs text-white/60">Try adjusting your filters or price limit.</p>
              <button 
                onClick={clearFilters}
                className="px-6 py-2.5 bg-[#8A1538] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#A81B45] transition-colors rounded-xl border border-[#D4AF37]/30"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl border-y border-[var(--theme-color-border)] px-6 py-14 text-center">
              <h3 className="font-serif text-3xl">No published products here yet</h3>
              <p className="mt-4 text-base text-[var(--theme-color-text-muted)]">Browse our photographed women&apos;s designs, or contact us about a pair you have seen.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/women" className="inline-flex min-h-12 items-center bg-[var(--theme-color-jewel)] px-6 text-sm font-semibold text-white">View women&apos;s designs</Link><Link href="/contact" className="inline-flex min-h-12 items-center border border-[var(--theme-color-border)] px-6 text-sm font-semibold">Contact Fashion Feet</Link></div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ShopProductCard key={product.id} product={product} onQuickView={() => setQuickViewProduct(product)} />
            ))}
          </div>
        )}
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Shop filters">
          <button type="button" className="absolute inset-0 bg-black/75" aria-label="Close filters" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl">Filter Collection</h2>
              <button type="button" onClick={() => setIsMobileFilterOpen(false)} aria-label="Close filters" className="rounded-lg p-2"><X className="h-5 w-5" /></button>
            </div>
            <FilterSidebar activeFilterCount={activeFilterCount} clearFilters={clearFilters} colors={colors} selectedColors={selectedColors} toggleColor={toggleColor} priceRange={priceRange} maxProductPrice={maxProductPrice} setPriceRange={setPriceRange} />
            <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="mt-8 w-full rounded-xl bg-[#8A1538] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white">Show {filteredProducts.length} products</button>
          </div>
        </div>
      )}
      <QuickViewModal product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}

function ShopProductCard({ product, onQuickView }: { product: any; onQuickView: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <StorefrontTiltCard className="bg-[#1C1412] border border-white/15 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group flex flex-col justify-between">
      <div 
        className="relative aspect-[4/5] bg-[#eee7de] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {product.images && product.images.length > 0 ? (
          <Image 
            src={product.images[0].url} 
            alt={product.title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
             <span className="font-serif text-[#D4AF37] opacity-50 text-2xl rotate-45 transform">JUTTI</span>
          </div>
        )}
        
        {(product.discount ?? 0) > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-[#8A1538] text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest rounded shadow">
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
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-[#D4AF37] hover:text-[#12080C] transition-all"
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>

        <div className={`absolute bottom-0 left-0 w-full p-4 transform transition-transform duration-300 ease-in-out ${isHovered ? "translate-y-0" : "translate-y-full"}`}>
          <Link href={`/product/${product.id}`} className="block w-full py-3 bg-[#8A1538] text-white text-center font-bold uppercase tracking-widest text-xs hover:bg-[#A81B45] transition-colors rounded-xl shadow-lg border border-[#D4AF37]/30">
            View Details
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-1 text-left border-t border-white/10 bg-[#1C1412]">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">{product.category}</span>
        <h3 className="font-serif text-base font-bold text-white truncate group-hover:text-[#D4AF37] transition-colors">
          <Link href={`/product/${product.id}`}>{product.title}</Link>
        </h3>
        <div className="flex items-center gap-2 pt-1 font-mono">
          <span className="font-bold text-sm text-white">₹{Math.round(product.price * (1 - (product.discount || 0) / 100)).toLocaleString('en-IN')}</span>
          {(product.discount ?? 0) > 0 && (
            <span className="text-xs text-white/70 line-through">₹{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </StorefrontTiltCard>
  );
}
