"use client";

import { useState } from "react";
import { X, Send, CheckCircle2, Loader2, MessageSquare, Sparkles, MessageCircle, UserCheck, Lock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createEnquiry } from "@/app/actions/enquiries";
import { useCartStore } from "@/store/cart";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/placeholders";

interface EnquiryModalProps {
  product: {
    id: string;
    title: string;
    productCode?: string;
    price?: number;
    category?: string;
    images?: any[];
  } | null;
  selectedSize?: string;
  selectedColor?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ENQUIRY_TYPES = [
  "General Product Enquiry",
  "Request Store Opening Updates",
  "Virtual Product Assistance"
];

export function EnquiryModal({ product, selectedSize, selectedColor, isOpen, onClose }: EnquiryModalProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteMessage, setNoteMessage] = useState("");
  const [enquiryType, setEnquiryType] = useState(ENQUIRY_TYPES[0]);

  const addItemToCartStore = useCartStore((state) => state.addItem);

  if (!isOpen || !product) return null;

  const isLoggedIn = status === "authenticated" && !!session?.user;

  // DYNAMIC PRODUCT VALUES
  const productSku = product.productCode || `FF-${product.id.slice(-6).toUpperCase()}`;
  const thumbnail = product.images?.[0]?.url || PLACEHOLDER_PRODUCT_IMAGE;
  const displaySize = selectedSize || "Not Selected (Fitting Assistance)";
  const displayColor = selectedColor || "Standard Color";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoggedIn) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("productId", product.id);
    formData.append("name", session?.user?.name || "Boutique Customer");
    formData.append("email", session?.user?.email || "");

    const fullMessage = `Enquiry Type: ${enquiryType} | SKU: ${productSku} | Color: ${displayColor} | Size: ${displaySize}${noteMessage ? ` | Customer Message: ${noteMessage}` : ""}`;

    if (selectedSize) {
      formData.append("size", selectedSize);
    }
    formData.append("message", fullMessage);

    const res = await createEnquiry(formData);
    setLoading(false);

    if (res.success) {
      addItemToCartStore({
        productId: product.id,
        title: product.title,
        price: product.price || 0,
        image: thumbnail,
        size: displaySize,
        quantity: 1
      });

      setSubmitted(true);
    } else {
      setError(res.error || "Failed to submit enquiry.");
    }
  };

  const handleWhatsAppInstant = () => {
    const text = encodeURIComponent(
      `Hello Fashion Feet! I have a ${enquiryType} regarding "${product.title}" (SKU: ${productSku}, Size: ${displaySize}, Color: ${displayColor}). ${noteMessage}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setError(null);
    setNoteMessage("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] shadow-2xl rounded-3xl overflow-hidden border border-[var(--theme-color-border)] my-8"
        >
          {/* Header */}
          <div className="bg-[var(--theme-color-jewel)] text-white p-6 relative">
            <button
              onClick={handleResetAndClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 rounded-full"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2 text-[var(--theme-color-accent)] uppercase tracking-widest text-[10px] font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Product Enquiry & Fitting Assistance
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnail} alt={product.title} className="w-full h-full object-cover" />
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold text-white tracking-tight leading-tight">{product.title}</h2>
                <div className="flex flex-wrap items-center gap-2 text-white/80 text-xs mt-0.5 font-mono">
                  <span>SKU: <strong className="text-[#D4AF37]">{productSku}</strong></span>
                  <span>&bull; Size: <strong className="text-[#D4AF37]">{displaySize}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Stores Coming Soon Disclaimer */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center gap-2 text-[11px] font-medium text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Fashion Feet physical boutiques are coming soon. Submit your enquiry below for virtual assistance or launch updates.</span>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 md:p-8 space-y-5">
            {!isLoggedIn ? (
              // Login Requirement Screen
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 bg-[var(--theme-color-bg)] text-[var(--theme-color-accent)] rounded-full flex items-center justify-center mx-auto border border-[var(--theme-color-border)] shadow-md">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-[var(--theme-color-text)]">Customer Account Required</h3>
                  <p className="text-[var(--theme-color-text-muted)] text-xs max-w-sm mx-auto leading-relaxed">
                    To submit product enquiries and receive fitting assistance, please sign into your Fashion Feet customer account.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                    onClick={onClose}
                    className="flex-1 py-3.5 bg-[var(--theme-color-jewel)] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg border border-[var(--theme-color-border)] text-center block"
                  >
                    Sign In
                  </Link>

                  <Link
                    href={`/register?callbackUrl=${encodeURIComponent(pathname)}`}
                    onClick={onClose}
                    className="flex-1 py-3.5 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] border border-[var(--theme-color-border)] text-xs font-bold uppercase tracking-widest rounded-xl hover:border-[var(--theme-color-accent)] transition-all text-center block"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            ) : submitted ? (
              // Success Screen
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[var(--theme-color-text)]">Enquiry Sent & Saved!</h3>
                <p className="text-[var(--theme-color-text-muted)] text-xs max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="font-bold text-[var(--theme-color-text)]">{session.user?.name}</span>! Your enquiry for <span className="font-bold text-[var(--theme-color-text)]">{product.title}</span> ({productSku}) has been saved and sent to our atelier team.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleWhatsAppInstant}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Instant WhatsApp Assistance
                  </button>

                  <button
                    onClick={handleResetAndClose}
                    className="px-6 py-3 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] border border-[var(--theme-color-border)] text-xs font-bold uppercase tracking-widest rounded-xl hover:border-[var(--theme-color-accent)] transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              // Authenticated Form Screen
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {error && (
                  <div className="p-3 bg-red-500/10 text-red-500 text-xs border border-red-500/20 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Logged in User Badge */}
                <div className="p-3 bg-[var(--theme-color-bg)] rounded-xl border border-[var(--theme-color-border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-[var(--theme-color-text)]">{session.user?.name}</span>
                      <span className="text-[var(--theme-color-text-muted)] text-[11px] block">{session.user?.email}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Account Verified
                  </span>
                </div>

                {/* Enquiry Type Selection */}
                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--theme-color-text-muted)] mb-1">
                    Enquiry Subject
                  </label>
                  <select
                    value={enquiryType}
                    onChange={(e) => setEnquiryType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--theme-color-bg)] border border-[var(--theme-color-border)] text-xs text-[var(--theme-color-text)] rounded-xl focus:outline-none focus:border-[var(--theme-color-accent)] font-semibold"
                  >
                    {ENQUIRY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--theme-color-text-muted)] mb-1">
                    Phone / WhatsApp Contact <span className="text-[var(--theme-color-text-muted)] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 bg-[var(--theme-color-bg)] border border-[var(--theme-color-border)] text-xs text-[var(--theme-color-text)] rounded-xl focus:outline-none focus:border-[var(--theme-color-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--theme-color-text-muted)] mb-1">
                    Message / Special Fitting Notes
                  </label>
                  <textarea
                    name="message"
                    rows={2}
                    value={noteMessage}
                    onChange={(e) => setNoteMessage(e.target.value)}
                    placeholder="Enter your sizing questions or customization preferences..."
                    className="w-full px-4 py-2.5 bg-[var(--theme-color-bg)] border border-[var(--theme-color-border)] text-xs text-[var(--theme-color-text)] rounded-xl focus:outline-none focus:border-[var(--theme-color-accent)] resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-[var(--theme-color-jewel)] text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-xl shadow-lg border border-[var(--theme-color-border)] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Product Enquiry
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppInstant}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
