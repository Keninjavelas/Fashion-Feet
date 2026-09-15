"use client";

import { useCartStore } from "@/store/cart";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function CheckoutClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = total > 5000 ? 0 : 250;
  const grandTotal = total + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      clearCart();
      setLoading(false);
      router.push("/checkout/success");
    }, 2000);
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h1 className="font-serif text-4xl text-[var(--color-brand-900)] mb-4">Your Bag is Empty</h1>
        <p className="text-gray-500 mb-8">Add items to your bag before checking out.</p>
        <Link href="/shop" className="inline-block px-8 py-4 bg-[var(--color-brand-900)] text-white font-medium uppercase tracking-widest hover:bg-[var(--color-accent-gold)] transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8">
      <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-brand-900)] mb-12 text-center">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left Column: Form */}
        <div className="w-full lg:w-3/5">
          <form onSubmit={handleSubmit} className="space-y-12">
            <section>
              <h2 className="font-serif text-2xl text-[var(--color-brand-900)] mb-6 border-b border-black/10 pb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium uppercase tracking-widest text-gray-700 mb-2">Email Address</label>
                  <input type="email" required className="w-full p-4 border border-black/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)]" placeholder="Email" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-brand-900)] mb-6 border-b border-black/10 pb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium uppercase tracking-widest text-gray-700 mb-2">First Name</label>
                  <input type="text" required className="w-full p-4 border border-black/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)]" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium uppercase tracking-widest text-gray-700 mb-2">Last Name</label>
                  <input type="text" required className="w-full p-4 border border-black/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium uppercase tracking-widest text-gray-700 mb-2">Address</label>
                  <input type="text" required className="w-full p-4 border border-black/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)]" placeholder="123 Main St" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium uppercase tracking-widest text-gray-700 mb-2">City</label>
                  <input type="text" required className="w-full p-4 border border-black/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)]" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium uppercase tracking-widest text-gray-700 mb-2">Postal Code</label>
                  <input type="text" required className="w-full p-4 border border-black/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)]" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-[var(--color-brand-900)] mb-6 border-b border-black/10 pb-4">Payment</h2>
              <div className="bg-gray-50 p-6 border border-black/10 text-center">
                <p className="text-sm text-gray-600">This is a demonstration store. No actual payment will be processed.</p>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-[var(--color-brand-900)] text-white font-medium uppercase tracking-widest hover:bg-[var(--color-accent-gold)] transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₹${grandTotal}`}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-2/5">
          <div className="bg-[var(--color-brand-50)] p-8 sticky top-32">
            <h2 className="font-serif text-2xl text-[var(--color-brand-900)] mb-6">Order Summary</h2>
            
            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-4">
                  <div className="relative w-20 h-24 flex-shrink-0 bg-white">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                    <span className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold z-10">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-[var(--color-brand-900)]">{item.title}</h4>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">{item.size}</p>
                    <p className="font-medium mt-1">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-black/10 pt-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between items-end border-t border-black/10 pt-4 mt-2">
                <span className="font-serif text-xl text-[var(--color-brand-900)]">Total</span>
                <span className="font-medium text-2xl text-[var(--color-brand-900)]">₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
