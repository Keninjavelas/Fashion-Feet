"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./Button";
import { EnquiryModal } from "../shop/EnquiryModal";

export function QuickViewModal({ product, isOpen, onClose }: { product: any; isOpen: boolean; onClose: () => void }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  if (!product) return null;

  const images: string[] = Array.isArray(product.images)
    ? product.images.map((image: { url?: string }) => image.url).filter((url: string | undefined): url is string => Boolean(url))
    : [];
  const sizes = String(product.sizes || "").split(",").map((size) => size.trim()).filter(Boolean);
  const activeImage = images[activeImageIndex] || images[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#281c1b]/80" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            role="dialog" aria-modal="true" aria-label={`Quick view of ${product.title}`}
            className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] shadow-2xl md:flex-row"
          >
            <button onClick={onClose} className="absolute right-4 top-4 z-30 rounded-full bg-[#281c1b] p-2 text-white" aria-label="Close quick view"><X className="h-5 w-5" /></button>
            <div className="relative flex min-h-[320px] w-full flex-col bg-[#f0e8df] md:min-h-[600px] md:w-1/2">
              <div className="relative min-h-[320px] flex-1">
                {activeImage ? <Image src={activeImage} alt={product.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-5" /> : <div className="flex h-full items-center justify-center p-10 text-center font-serif text-xl text-[#6d5a50]">Product photography coming soon</div>}
              </div>
              {images.length > 1 && <div className="flex gap-2 overflow-x-auto border-t border-[#d9cfc4] p-3" aria-label="Product photographs">{images.map((image, index) => (
                <button key={image} onClick={() => setActiveImageIndex(index)} aria-label={`View photograph ${index + 1}`} aria-pressed={activeImageIndex === index} className={`relative h-16 w-16 shrink-0 overflow-hidden border-2 ${activeImageIndex === index ? "border-[#861638]" : "border-transparent"}`}><Image src={image} alt="" fill sizes="64px" className="object-cover" /></button>
              ))}</div>}
            </div>
            <div className="flex w-full flex-col overflow-y-auto p-6 text-[var(--theme-color-text)] md:w-1/2 md:p-10">
              {product.category && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-color-accent)]">{product.category}</p>}
              <h2 className="font-serif text-3xl font-semibold md:text-4xl">{product.title}</h2>
              <p className="mt-5 border-b border-[var(--theme-color-border)] pb-6 text-2xl font-semibold">₹{Number(product.promoPrice) > 0 && Number(product.promoPrice) < Number(product.price) ? Number(product.promoPrice).toLocaleString("en-IN") : Math.round(Number(product.price) * (1 - Number(product.discount || 0) / 100)).toLocaleString("en-IN")}</p>
              <div className="mt-7 flex-1">
                {sizes.length > 0 ? <><h3 className="mb-3 text-sm font-semibold">Available size options</h3><div className="flex flex-wrap gap-2">{sizes.map((size) => <button key={size} onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size} className={`min-h-11 border px-4 text-sm ${selectedSize === size ? "border-[var(--theme-color-jewel)] bg-[var(--theme-color-jewel)] text-white" : "border-[var(--theme-color-border)]"}`}>{size}</button>)}</div></> : <p className="text-sm text-[var(--theme-color-text-muted)]">Ask us about sizes and fitting for this pair.</p>}
              </div>
              <div className="mt-8 flex flex-col gap-3 border-t border-[var(--theme-color-border)] pt-6">
                <Button onClick={() => setEnquiryOpen(true)} className="w-full py-3.5">Enquire about this pair</Button>
                <Button as="link" href={`/product/${product.id}`} variant="secondary" className="w-full py-3.5">View full details</Button>
              </div>
            </div>
          </motion.div>
          <EnquiryModal product={product} selectedSize={selectedSize} isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
        </div>
      )}
    </AnimatePresence>
  );
}
