import Link from "next/link";
import { Store, ArrowRight, Sparkles } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default function CartPage() {
  return (
    <StorefrontLayout>
      <div className="pt-32 pb-24 min-h-screen bg-[var(--color-brand-50)] flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center">
          <div className="bg-white border border-black/5 shadow-2xl p-10 md:p-16 rounded-xl space-y-6">
            <div className="w-20 h-20 bg-[var(--color-brand-100)] text-[var(--color-brand-900)] rounded-full flex items-center justify-center mx-auto border border-[var(--color-brand-300)]">
              <Store className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-2 text-[var(--color-accent-gold)] uppercase tracking-widest text-xs font-semibold">
              <Sparkles className="w-4 h-4" /> Digital Showroom Notice
            </div>

            <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-brand-900)] tracking-tight">
              Fashion Feet Digital Showroom
            </h1>

            <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">
              At Fashion Feet, we believe that handcrafted Punjabi Juttis deserve to be experienced in person. Rather than delivering a product in a box, we invite you to explore our collections online, save your favorite pairs, and enquire about fittings for our upcoming boutique store openings.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-[var(--color-brand-900)] text-white font-medium uppercase tracking-widest text-xs hover:bg-[var(--color-accent-gold)] transition-colors flex items-center justify-center gap-2"
              >
                Explore Collections <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/stores"
                className="w-full sm:w-auto px-8 py-4 border border-black/20 text-[var(--color-brand-900)] font-medium uppercase tracking-widest text-xs hover:bg-black/5 transition-colors flex items-center justify-center"
              >
                Find a Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
