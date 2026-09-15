import Link from "next/link";
import { Heart, Sparkles, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Image from "next/image";

export default async function FavoritesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return <div>Please log in to view your favorites.</div>;
  }

  const wishlists = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { images: true } } }
  });

  const favorites = wishlists.map(w => w.product);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-black/5 pb-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-brand-900)] mb-2">My Favorites</h1>
          <p className="text-gray-600">Items you've loved while browsing.</p>
        </div>
        <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">{favorites.length} Saved Pairs</span>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((product) => (
            <div key={product.id} className="group relative bg-white border border-black/5 shadow-sm overflow-hidden flex flex-col">
              
              {/* Image */}
              <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-[var(--color-brand-50)]">
                {(product.discount ?? 0) > 0 && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-[var(--color-accent-burgundy)] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                    Sale
                  </div>
                )}
                {product.images && product.images.length > 0 ? (
                  <Image 
                    src={product.images[0].url} 
                    alt={product.title}
                    fill
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-brand-100)] to-[var(--color-brand-300)]">
                    <span className="font-serif text-[var(--color-brand-600)] opacity-50 text-2xl rotate-45 transform">JUTTI</span>
                  </div>
                )}
              </Link>
              
              {/* Details */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/product/${product.id}`} className="font-serif text-lg text-[var(--color-brand-900)] hover:text-[var(--color-accent-gold)] transition-colors">
                    {product.title}
                  </Link>
                  <Heart className="w-5 h-5 text-[var(--color-accent-burgundy)] fill-current flex-shrink-0 ml-4" />
                </div>
                
                <div className="mt-auto pt-4 flex items-center gap-3">
                  {(product.discount ?? 0) > 0 ? (
                    <>
                      <span className="font-medium text-lg text-[var(--color-brand-900)]">
                        ₹{product.price}
                      </span>
                      <span className="text-gray-400 line-through text-sm">₹{Math.round(product.price * (1 + (product.discount ?? 0) / 100))}</span>
                    </>
                  ) : (
                    <span className="font-medium text-lg text-[var(--color-brand-900)]">₹{product.price}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-24 bg-white border border-black/5 rounded-lg shadow-sm">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
            <div className="relative bg-red-50 text-red-400 p-6 rounded-full">
              <Heart className="w-16 h-16" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-4 -right-4 text-red-300 transform rotate-12">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <h3 className="font-serif text-3xl text-[var(--color-brand-900)] mb-3">No favorites yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Build your wishlist by clicking the heart icon on any product. We'll save them here for you to easily find later.</p>
          <Link href="/shop" className="inline-block px-8 py-4 bg-[var(--color-brand-900)] text-white text-sm font-medium uppercase tracking-widest hover:bg-[var(--color-accent-gold)] transition-colors rounded-sm shadow-md">
            Discover Styles
          </Link>
        </div>
      )}
    </div>
  );
}
