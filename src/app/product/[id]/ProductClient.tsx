"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Ruler, ChevronDown, MessageSquare, Info, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EnquiryModal } from "@/components/shop/EnquiryModal";
import { toggleWishlist } from "@/app/actions/wishlist";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/placeholders";
import { ThreeJuttiHeroCanvas } from "@/components/three/ThreeJuttiHeroCanvas";
import {
  FOOTWEAR_DESIGN_TOKENS,
  type AccentSwatchName,
} from "@/components/three/ProceduralPunjabiJutti";

function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--theme-color-border)] py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-left focus:outline-none focus:ring-2 focus:ring-[var(--theme-color-accent)] rounded-sm"
      >
        <h4 className="font-serif text-xl text-[var(--theme-color-text)] font-bold">{title}</h4>
        <ChevronDown className={`w-5 h-5 text-[var(--theme-color-accent)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 1 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 text-[var(--theme-color-text-muted)] leading-relaxed text-sm">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductClient({ product, initialIsWishlisted = false }: { product: any, initialIsWishlisted?: boolean }) {
  const { data: session } = useSession();
  const [selectedSize, setSelectedSize] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const [showError, setShowError] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [activeViewerMode, setActiveViewerMode] = useState<"3d" | "photos">("3d");
  const [activeAccent, setActiveAccent] = useState<AccentSwatchName>("crimson");

  // Guarantee top position scroll on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Pre-select user's saved size if available
  const savedUserSize = (session?.user as any)?.size || "";
  const savedUkSize = useMemo(() => {
    if (!savedUserSize) return "";
    const match = savedUserSize.match(/UK\s*\d+/i);
    return match ? match[0].toUpperCase() : "";
  }, [savedUserSize]);

  useEffect(() => {
    if (savedUkSize && selectedSize === "") {
      setSelectedSize(savedUkSize);
    }
  }, [savedUkSize, selectedSize]);



  const images = useMemo(
    () =>
      product.images?.length > 0
        ? product.images.map((img: any) => img.url)
        : [PLACEHOLDER_PRODUCT_IMAGE, PLACEHOLDER_PRODUCT_IMAGE],
    [product.images]
  );
       
  const activeImage = images[activeImageIndex];
  const sizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];

  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const currentProduct = {
        id: product.id,
        name: product.title,
        price: product.price,
        image: images[0] || "",
        viewedAt: new Date().toISOString()
      };
      
      const filtered = recent.filter((p: any) => p.id !== product.id);
      const updated = [currentProduct, ...filtered].slice(0, 12);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch(e) {
      console.error('Failed to save recently viewed', e);
    }
  }, [product.id, product.title, product.price, images]);

  const handleWishlistToggle = async () => {
    setIsWishlistLoading(true);
    const previousState = isWishlisted;
    setIsWishlisted(!isWishlisted);
    
    const result = await toggleWishlist(product.id);
    if (result.error) {
      setIsWishlisted(previousState);
      alert(result.error);
    } else {
      setIsWishlisted(result.isWishlisted ?? !previousState);
    }
    setIsWishlistLoading(false);
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 md:px-8 relative space-y-12 text-[var(--theme-color-text)]">
      <Breadcrumbs 
        items={[
          { label: product.category, href: `/shop?category=${product.category}` },
          { label: product.title }
        ]} 
      />

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Images + 3D Section */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div
            role="tablist"
            aria-label="Product viewer mode"
            className="flex gap-2 p-1 bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] rounded-2xl w-fit mx-auto lg:mx-0"
          >
            {(["3d", "photos"] as const).map((mode) => {
              const isActive = activeViewerMode === mode;
              return (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveViewerMode(mode)}
                  className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 ${
                    isActive
                      ? "bg-[var(--theme-color-jewel)] text-white shadow-md"
                      : "text-[var(--theme-color-text-muted)] hover:text-[var(--theme-color-text)]"
                  }`}
                >
                  {mode === "3d" ? "Interactive 3D" : "Product Photos"}
                </button>
              );
            })}
          </div>

          {activeViewerMode === "3d" ? (
            <div className="flex flex-col gap-4">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-[var(--theme-color-border)]">
                <ThreeJuttiHeroCanvas
                  className="!aspect-auto !w-full !h-full"
                  aspectRatio={4 / 5}
                  accent={activeAccent}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3" role="radiogroup" aria-label="Velvet accent colour">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-color-text-muted)]">
                  Colourway
                </span>
                {Object.entries(FOOTWEAR_DESIGN_TOKENS.accentSwatches).map(([name, hex]) => {
                  const isActive = name === activeAccent;
                  const colour = `#${hex.toString(16).padStart(6, "0")}`;
                  return (
                    <button
                      key={name}
                      role="radio"
                      aria-checked={isActive}
                      aria-label={`${name} velvet`}
                      onClick={() => setActiveAccent(name as AccentSwatchName)}
                      className={`w-8 h-8 rounded-full transition-all shadow-md border-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 ${
                        isActive ? "border-[var(--theme-color-accent)] scale-110" : "border-[var(--theme-color-border)]"
                      }`}
                      style={{ backgroundColor: colour }}
                      title={`${name.charAt(0).toUpperCase()}${name.slice(1)} velvet`}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div
                className="relative aspect-[4/5] bg-[var(--theme-color-surface)] rounded-2xl flex items-center justify-center overflow-hidden shadow-xl border border-[var(--theme-color-border)]"
              >
                <Image src={activeImage} alt={product.title} fill className="object-cover transition-transform duration-700" sizes="(max-width: 1024px) 100vw, 50vw" priority />
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2" role="listbox" aria-label="Product image gallery thumbnails">
                {images.map((img: string, i: number) => {
                  const isActive = activeImageIndex === i;
                  return (
                    <button
                      key={i}
                      role="option"
                      aria-selected={isActive}
                      aria-label={`View product image ${i + 1}`}
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative w-20 h-24 flex-shrink-0 bg-[var(--theme-color-surface)] rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--theme-color-accent)]/40 ${
                        isActive ? 'border-[var(--theme-color-accent)] scale-105 shadow-md' : 'border-[var(--theme-color-border)] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`${product.title} view ${i + 1}`} fill className="object-cover rounded-lg" sizes="80px" />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--theme-color-accent)] bg-[var(--theme-color-surface)] px-3 py-1 rounded-full border border-[var(--theme-color-border)] shadow-sm">
              {product.category}
            </span>
            <div className="flex gap-4">
              <button 
                onClick={handleWishlistToggle}
                disabled={isWishlistLoading}
                className="transition-colors focus:outline-none rounded-full p-2 hover:bg-black/5 disabled:opacity-50 text-[var(--theme-color-text)]"
                aria-label="Wishlist"
              >
                <Heart className={`w-6 h-6 transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-[var(--theme-color-text-muted)]"}`} />
              </button>
            </div>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--theme-color-text)] mb-4 font-bold tracking-tight">{product.title}</h1>
          
          <div className="flex items-center gap-4 mb-8 border-b border-[var(--theme-color-border)] pb-8">
            <span className="font-sans text-3xl font-bold text-[var(--theme-color-text)]">₹{product.price.toLocaleString('en-IN')}</span>
            {(product.discount ?? 0) > 0 && (
              <>
                <span className="font-sans text-lg text-[var(--theme-color-text-muted)] line-through">₹{Math.round(product.price * (1 + product.discount/100)).toLocaleString('en-IN')}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-white bg-[var(--theme-color-jewel)] px-2.5 py-1 rounded border border-[var(--theme-color-border)] shadow-sm">
                  {product.discount}% Offer
                </span>
              </>
            )}
          </div>

          <div className="mb-8 space-y-3">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <h3 className="font-sans font-bold uppercase tracking-widest text-xs text-[var(--theme-color-accent)]">Select Size</h3>
                {savedUserSize && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Saved Size: <strong>{savedUserSize}</strong>
                  </span>
                )}
              </div>
              <Link href="/size-guide" className="flex items-center text-xs font-semibold text-[var(--theme-color-text)] hover:text-[var(--theme-color-accent)] transition-colors">
                <Ruler className="w-4 h-4 mr-1 text-[var(--theme-color-accent)]" /> Interactive Size Studio
              </Link>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {sizes.map(size => {
                const isSaved = savedUserSize.toUpperCase().includes(size);
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setShowError(false); }}
                    aria-pressed={isSelected}
                    aria-label={`Select size ${size}`}
                    className={`py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border relative focus:outline-none focus:ring-2 focus:ring-[var(--theme-color-accent)]/40 ${
                      isSelected
                        ? "bg-[var(--theme-color-jewel)] text-white border-[var(--theme-color-accent)] shadow-lg"
                        : "bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] border-[var(--theme-color-border)] hover:border-[var(--theme-color-accent)]"
                    }`}
                  >
                    {size}
                    {isSaved && (
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" aria-hidden="true" title="Your Saved Profile Size"></span>
                    )}
                  </button>
                );
              })}
            </div>
            {showError && <p className="text-xs text-rose-500 mt-2 font-bold">Please select a size before inquiring.</p>}
          </div>

          {/* Product Inquiry CTA */}
          <div className="space-y-4 mb-8">
            <button 
              onClick={() => {
                if (!selectedSize) {
                  setShowError(true);
                  return;
                }
                setEnquiryOpen(true);
              }}
              aria-label={selectedSize ? `Open product enquiry for size ${selectedSize}` : 'Select a size before inquiring'}
              className="w-full py-4 bg-[var(--theme-color-jewel)] text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all rounded-xl shadow-xl border border-[var(--theme-color-border)] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--theme-color-accent)]/40"
            >
              <MessageSquare className="w-4 h-4 text-[var(--theme-color-accent)]" /> Submit Product Enquiry
            </button>

            {/* Explainer Note */}
            <div className="p-4 bg-[var(--theme-color-surface)] rounded-xl border border-[var(--theme-color-border)] text-xs text-[var(--theme-color-text-muted)] space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-[var(--theme-color-accent)] font-bold">
                <Info className="w-4 h-4" /> Why Fashion Feet offers product enquiries:
              </div>
              <p className="leading-relaxed font-light">
                Handcrafted Punjabi Juttis mold specifically to the shape of your foot over time. We believe luxury footwear should be experienced in person or discussed directly with master craftsmen.
              </p>
            </div>
          </div>

          {/* Accordion Specs */}
          <div className="space-y-2">
            <Accordion title="Artisanal Craftsmanship & Materials" defaultOpen={true}>
              <ul className="space-y-2 list-disc list-inside">
                <li>100% Genuine vegetable-tanned leather sole</li>
                <li>Hand-stitched zari & dabka embroidery by Punjabi artisans</li>
                <li>Padded velvet arch cushioning</li>
                <li>Hypoallergenic inner lining</li>
              </ul>
            </Accordion>
            <Accordion title="Craft Guarantee">
              <p>Every Fashion Feet pair is guaranteed for artisanal craftsmanship and durability. Support and fitting adjustments are provided by our master craftsmen.</p>
            </Accordion>
          </div>
        </div>
      </div>

      <EnquiryModal 
        product={product} 
        selectedSize={selectedSize} 
        isOpen={enquiryOpen} 
        onClose={() => setEnquiryOpen(false)} 
      />
    </div>
  );
}
