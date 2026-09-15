"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ChevronDown } from "lucide-react";
import { updateSize } from "../actions";
import { useRouter } from "next/navigation";

export function SizeSelector({ currentSize }: { currentSize: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedSize, setSelectedSize] = useState(currentSize);

  const sizes = ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];

  const handleSave = async () => {
    if (!selectedSize || selectedSize === currentSize) return;
    
    setLoading(true);
    const res = await updateSize(selectedSize);
    setLoading(false);
    
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 relative">
      {success && (
        <div className="absolute -top-12 right-0 bg-green-50 text-green-700 px-4 py-2 text-sm flex items-center gap-2 border border-green-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" /> Size saved
        </div>
      )}
      
      <div className="relative">
        <select 
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="appearance-none pl-6 pr-12 py-3 bg-white border border-black/20 text-sm font-medium uppercase tracking-widest text-[var(--color-brand-900)] focus:outline-none focus:border-[var(--color-brand-900)] min-w-[160px] cursor-pointer"
        >
          <option value="" disabled>Select Size</option>
          {sizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>

      <button 
        onClick={handleSave}
        disabled={loading || selectedSize === currentSize}
        className="px-6 py-3 bg-[var(--color-brand-900)] text-white text-sm font-medium uppercase tracking-widest hover:bg-[var(--color-accent-gold)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Size"}
      </button>
    </div>
  );
}
