"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function RecentlyViewedPage() {
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentProducts(recent);
    } catch(e) {
      console.error('Failed to parse recently viewed', e);
    }
  }, []);
  return (
    <div className="space-y-8">
      <div className="border-b border-black/5 pb-4">
        <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-brand-900)] mb-2">Recently Viewed</h1>
        <p className="text-gray-600">Continue exploring where you left off.</p>
      </div>

      {recentProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group block bg-white border border-black/5 shadow-sm overflow-hidden">
              <div className="relative aspect-square overflow-hidden bg-[var(--color-brand-50)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-serif text-md text-[var(--color-brand-900)] group-hover:text-[var(--color-accent-gold)] transition-colors line-clamp-1 mb-1">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm">₹{product.price.toLocaleString('en-IN')}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-black/5">
          <Clock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="font-serif text-xl text-[var(--color-brand-900)] mb-2">No history yet</h3>
          <p className="text-gray-500 mb-6">Start browsing our collection to see your recently viewed items here.</p>
          <Link href="/" className="inline-block px-6 py-3 bg-[var(--color-brand-900)] text-white text-sm font-medium uppercase tracking-widest hover:bg-[var(--color-accent-gold)] transition-colors">
            Start Shopping
          </Link>
        </div>
      )}
      
      {/* Information about guest browsing */}
      <div className="mt-12 bg-white border border-black/5 p-6 flex items-start gap-4 shadow-sm">
        <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-gray-900 text-sm uppercase tracking-widest mb-1">Browsing History</h4>
          <p className="text-gray-500 text-sm">
            We securely save your recently viewed items so you can easily pick up where you left off. This history is synced across your devices when you are logged in.
          </p>
        </div>
      </div>
    </div>
  );
}
