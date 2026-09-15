import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./Button";
import { EnquiryModal } from "../shop/EnquiryModal";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/placeholders";

export function QuickViewModal({ product, isOpen, onClose }: { product: any, isOpen: boolean, onClose: () => void }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const sizes = ["US 6", "US 7", "US 8", "US 9", "US 10"]; // Hardcoded for now
  
  if (!product) return null;

  const image = product.images?.[0]?.url || PLACEHOLDER_PRODUCT_IMAGE;

  const handleOpenEnquiry = () => {
    setEnquiryOpen(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-[var(--background)] shadow-2xl z-10 flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-white/80 md:bg-transparent rounded-full hover:bg-black/5 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-full md:w-1/2 relative aspect-[4/5] md:aspect-auto md:h-full bg-[var(--color-brand-50)]">
              <Image src={image} alt={product.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
              <p className="text-xs uppercase tracking-widest text-[var(--color-brand-600)] mb-2">{product.category}</p>
              <h2 className="font-serif text-3xl text-[var(--color-brand-900)] mb-4">{product.title}</h2>
              
              <div className="flex items-center gap-3 mb-8">
                <span className="font-sans text-xl text-[var(--color-brand-900)]">₹{product.price}</span>
                {product.discount > 0 && (
                  <>
                    <span className="font-sans text-sm text-foreground/40 line-through">₹{Math.round(product.price * (1 + product.discount/100))}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent-burgundy)] border border-[var(--color-accent-burgundy)] px-1 py-0.5">Sale</span>
                  </>
                )}
              </div>
              
              <div className="mb-8 flex-1">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-sans font-medium uppercase tracking-widest text-xs">Select Size</h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 border text-xs transition-all duration-300 ${
                        selectedSize === size
                          ? "border-[var(--color-brand-900)] bg-[var(--color-brand-900)] text-white"
                          : "border-black/20 hover:border-black/50 text-foreground"
                      }`}
                    >
                      {size.replace("US ", "")}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mt-auto">
                <Button onClick={handleOpenEnquiry} className="w-full">
                  Enquire About This Pair
                </Button>
                <Button as="link" href={`/product/${product.id}`} variant="secondary" className="w-full">
                  View Full Details
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <EnquiryModal 
        product={product} 
        selectedSize={selectedSize} 
        isOpen={enquiryOpen} 
        onClose={() => setEnquiryOpen(false)} 
      />
    </AnimatePresence>
  );
}
