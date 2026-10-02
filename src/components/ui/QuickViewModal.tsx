"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./Button";
import { EnquiryModal } from "../shop/EnquiryModal";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/placeholders";
import { ThreeJuttiHeroCanvas } from "../three/ThreeJuttiHeroCanvas";
import {
  FOOTWEAR_DESIGN_TOKENS,
  type AccentSwatchName,
} from "../three/ProceduralPunjabiJutti";

export function QuickViewModal({
  product,
  isOpen,
  onClose,
}: {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeViewerMode, setActiveViewerMode] = useState<"3d" | "photos">("3d");
  const [activeAccent, setActiveAccent] = useState<AccentSwatchName>("crimson");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const sizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];

  if (!product) return null;

  const images =
    product.images?.length > 0
      ? product.images.map((img: any) => img.url)
      : [PLACEHOLDER_PRODUCT_IMAGE, PLACEHOLDER_PRODUCT_IMAGE];
  const activeImage = images[activeImageIndex];

  const handleOpenEnquiry = () => {
    setEnquiryOpen(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-5xl bg-[var(--theme-color-surface)] shadow-2xl z-10 flex flex-col md:flex-row overflow-hidden max-h-[92vh] rounded-3xl border border-[var(--theme-color-border)]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 backdrop-blur-md text-white/80 hover:text-[#D4AF37] hover:bg-black/70 transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
              aria-label="Close quick view modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full md:w-1/2 relative bg-[var(--theme-color-bg)] border-b md:border-b-0 md:border-r border-[var(--theme-color-border)]">
              <div
                role="tablist"
                aria-label="Product viewer mode"
                className="absolute top-4 left-4 z-20 flex gap-1.5 p-1 bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 rounded-full shadow-lg"
              >
                {(["3d", "photos"] as const).map((mode) => {
                  const isActive = activeViewerMode === mode;
                  return (
                    <button
                      key={mode}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveViewerMode(mode)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 ${
                        isActive
                          ? "bg-[#D4AF37] text-black shadow"
                          : "text-white/70 hover:text-[#D4AF37]"
                      }`}
                    >
                      {mode === "3d" ? "3D Live" : "Photos"}
                    </button>
                  );
                })}
              </div>

              {activeViewerMode === "3d" ? (
                <div className="relative h-[48vh] md:h-full">
                  <ThreeJuttiHeroCanvas
                    className="!aspect-auto !w-full !h-full !rounded-none !border-0"
                    aspectRatio={4 / 5}
                    accent={activeAccent}
                    showControls={true}
                  />
                </div>
              ) : (
                <div className="relative h-[48vh] md:h-full flex flex-col">
                  <div className="relative flex-1 bg-[var(--theme-color-surface)] flex items-center justify-center overflow-hidden">
                    <Image
                      src={activeImage}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                  {images.length > 1 && (
                    <div
                      className="flex gap-2 p-3 overflow-x-auto bg-[var(--theme-color-bg)] border-t border-[var(--theme-color-border)]"
                      role="listbox"
                      aria-label="Product image gallery thumbnails"
                    >
                      {images.map((img: string, i: number) => {
                        const isActive = activeImageIndex === i;
                        return (
                          <button
                            key={i}
                            role="option"
                            aria-selected={isActive}
                            aria-label={`View product image ${i + 1}`}
                            onClick={() => setActiveImageIndex(i)}
                            className={`relative w-16 h-20 flex-shrink-0 bg-[var(--theme-color-surface)] rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--theme-color-accent)]/40 ${
                              isActive
                                ? "border-[var(--theme-color-accent)] scale-105 shadow-md"
                                : "border-[var(--theme-color-border)] opacity-70 hover:opacity-100"
                            }`}
                          >
                            <Image
                              src={img}
                              alt={`${product.title} view ${i + 1}`}
                              fill
                              className="object-cover rounded-md"
                              sizes="64px"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeViewerMode === "3d" && (
                <div
                  role="radiogroup"
                  aria-label="Velvet accent colour"
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 rounded-full shadow-lg"
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37] mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Velvet
                  </span>
                  {Object.entries(FOOTWEAR_DESIGN_TOKENS.accentSwatches).map(
                    ([name, hex]) => {
                      const isActive = name === activeAccent;
                      const colour = `#${hex.toString(16).padStart(6, "0")}`;
                      return (
                        <button
                          key={name}
                          role="radio"
                          aria-checked={isActive}
                          aria-label={`${name} velvet body`}
                          onClick={() =>
                            setActiveAccent(name as AccentSwatchName)
                          }
                          className={`w-6 h-6 rounded-full transition-all shadow-md border-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 ${
                            isActive
                              ? "border-[#D4AF37] scale-110"
                              : "border-white/20"
                          }`}
                          style={{ backgroundColor: colour }}
                          title={`${name.charAt(0).toUpperCase()}${name.slice(1)} velvet`}
                        />
                      );
                    }
                  )}
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
              <p className="text-xs uppercase tracking-widest text-[var(--theme-color-accent)] mb-2 font-bold">
                {product.category}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-[var(--theme-color-text)] mb-3 font-bold tracking-tight">
                {product.title}
              </h2>

              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--theme-color-border)]">
                <span className="font-sans text-2xl font-bold text-[var(--theme-color-text)]">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {(product.discount ?? 0) > 0 && (
                  <>
                    <span className="font-sans text-sm text-[var(--theme-color-text-muted)] line-through">
                      ₹
                      {Math.round(
                        product.price * (1 + product.discount / 100)
                      ).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-[var(--theme-color-jewel)] px-2 py-0.5 rounded-full border border-[var(--theme-color-border)] shadow-sm">
                      {product.discount}% Off
                    </span>
                  </>
                )}
              </div>

              <div className="mb-6 flex-1 space-y-4">
                <div className="flex justify-between items-end mb-3">
                  <h3 className="font-sans font-bold uppercase tracking-widest text-xs text-[var(--theme-color-accent)]">
                    Select Size
                  </h3>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  {sizes.map((size) => {
                    const num = size.replace("UK ", "");
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={isSelected}
                        aria-label={`Select size ${size}`}
                        className={`py-3 text-sm font-bold border rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--theme-color-accent)]/50 ${
                          isSelected
                            ? "border-[var(--theme-color-accent)] bg-[var(--theme-color-jewel)] text-white shadow-lg scale-105"
                            : "border-[var(--theme-color-border)] bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] hover:border-[var(--theme-color-accent)] hover:bg-[var(--theme-color-surface)]"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[var(--theme-color-text-muted)] font-medium pt-1">
                  UK sizing · Genuine leather molds to your feet over time
                </p>
              </div>

              <div className="flex flex-col gap-2.5 mt-auto pt-4 border-t border-[var(--theme-color-border)]">
                <Button
                  onClick={handleOpenEnquiry}
                  className="w-full py-3.5 !text-[11px]"
                >
                  Enquire About This Pair
                </Button>
                <Button
                  as="link"
                  href={`/product/${product.id}`}
                  variant="secondary"
                  className="w-full py-3.5 !text-[11px]"
                >
                  View Full Details
                </Button>
              </div>
            </div>
          </motion.div>
          <EnquiryModal
            product={product}
            selectedSize={selectedSize}
            isOpen={enquiryOpen}
            onClose={() => setEnquiryOpen(false)}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
