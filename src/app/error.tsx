"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1F1A17] pt-32 pb-24 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-500/20 shadow-xl">
          <RefreshCw className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-rose-600">Runtime Recovery State</span>
          <h1 className="font-serif text-3xl font-bold text-[#1F1A17]">Something Went Wrong</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            An unexpected error occurred while processing this storefront view. Our system has logged the event.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3.5 bg-[#8A1538] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 border border-[#C5A059]"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>

          <Link
            href="/"
            className="px-6 py-3.5 bg-white text-[#1F1A17] border border-black/10 text-xs font-bold uppercase tracking-widest rounded-xl hover:border-[#C5A059] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
