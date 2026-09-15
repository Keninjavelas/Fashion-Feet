"use client";

import { useCartStore } from "@/store/cart";
import { X, MessageSquare, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] h-full flex flex-col justify-between shadow-2xl border-l border-[var(--theme-color-border)] p-6 space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--theme-color-border)] pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--theme-color-accent)]" />
            <h3 className="font-serif text-xl font-bold">Saved Fitting Inquiries ({items.length})</h3>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-[var(--theme-color-text-muted)] hover:text-[var(--theme-color-text)] rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Inquiries List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-[var(--theme-color-accent)]/40 mx-auto" />
              <p className="font-serif text-lg font-bold text-[var(--theme-color-text)]">No pending fitting inquiries</p>
              <p className="text-xs text-[var(--theme-color-text-muted)] max-w-xs mx-auto leading-relaxed">
                Explore our handcrafted Punjabi Juttis and click "Inquire at Boutique Store" to reserve fitting sessions.
              </p>
              <button
                onClick={closeCart}
                className="mt-4 px-6 py-2.5 bg-[var(--theme-color-jewel)] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow border border-[var(--theme-color-border)]"
              >
                Browse Showroom
              </button>
            </div>
          ) : (
            items.map((item) => {
              const imgUrl = item.image || "https://images.unsplash.com/photo-1605807646983-377bc5a76493?q=80&w=400";

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 bg-[var(--theme-color-bg)] rounded-xl border border-[var(--theme-color-border)] shadow-sm"
                >
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-1 text-left">
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-sm font-bold text-[var(--theme-color-text)] truncate max-w-[180px]">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[var(--theme-color-accent)] font-bold">Requested Size: UK {item.size}</p>
                    <p className="font-mono text-xs font-bold text-[var(--theme-color-text)]">₹{item.price.toLocaleString('en-IN')}</p>
                    <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full mt-1">
                      Ready for Boutique Fitting
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--theme-color-border)] pt-4 space-y-4">
            <Link
              href="/stores"
              onClick={closeCart}
              className="w-full py-4 bg-[var(--theme-color-jewel)] text-white text-xs font-bold uppercase tracking-widest text-center rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 border border-[var(--theme-color-border)] block"
            >
              Locate Boutique Store <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
