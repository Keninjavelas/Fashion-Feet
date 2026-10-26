"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "use-debounce";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  images: { url: string }[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err: any) {
        console.error("Search error:", err);
        setError("Something went wrong while searching.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [debouncedQuery]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 w-full z-[70] bg-[var(--background)] shadow-2xl border-b border-black/10"
          >
            <div className="container mx-auto px-4 py-6 md:py-8">
              {/* Search Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="relative flex-1 max-w-4xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/50" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for Juttis, Categories, Styles..."
                    className="w-full bg-black/5 border-none rounded-full py-4 pl-14 pr-6 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)] transition-all font-serif"
                    autoFocus
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--color-accent-gold)] animate-spin" />
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 p-2 text-foreground/70 hover:text-foreground transition-colors hover:bg-black/5 rounded-full"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-w-4xl mx-auto min-h-[300px] max-h-[60vh] overflow-y-auto custom-scrollbar">
                {!query.trim() && (
                  <div className="pt-8">
                    <h3 className="font-sans text-sm font-semibold uppercase tracking-widest text-foreground/50 mb-4">Popular Searches</h3>
                    <div className="flex flex-wrap gap-3">
                      {["Daily Wear", "Festive", "Ceremonial", "Men", "Women"].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-4 py-2 bg-black/5 hover:bg-black/10 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)]"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center text-red-500 py-8">
                    <p>{error}</p>
                  </div>
                )}

                {query.trim() && !isLoading && results.length === 0 && !error && (
                  <div className="text-center py-12">
                    <p className="text-xl font-serif text-foreground/70 mb-2">No results found</p>
                    <p className="text-foreground/50">We couldn't find anything matching "{query}"</p>
                  </div>
                )}

                {results.length > 0 && (
                  <>
                    <div className="flex justify-between items-end mb-4 pt-4">
                       <h3 className="font-sans text-sm font-semibold uppercase tracking-widest text-foreground/50">Products</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                    {results.map((product) => (
                      <Link
                        href={`/product/${product.id}`}
                        key={product.id}
                        onClick={onClose}
                        className="group flex flex-col space-y-3 p-3 rounded-2xl hover:bg-black/5 transition-colors"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-black/5">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/10">
                              <span className="text-foreground/30 font-serif">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs uppercase tracking-wider text-foreground/50 font-medium mb-1">
                            {product.category}
                          </span>
                          <h4 className="font-serif text-lg font-medium group-hover:text-[var(--color-accent-gold)] transition-colors line-clamp-1">
                            {product.title}
                          </h4>
                          <span className="text-foreground/80 mt-1">₹{product.price.toLocaleString()}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="flex justify-center pb-8 pt-4">
                    <Link 
                      href={`/shop?q=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="inline-flex items-center text-sm font-medium uppercase tracking-widest text-[var(--color-brand-900)] hover:text-[var(--color-accent-gold)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)] rounded-sm p-2"
                    >
                      View all results for "{query}"
                    </Link>
                  </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
