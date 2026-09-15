"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { updatePreferences } from "../actions";
import { useRouter } from "next/navigation";

export default function PreferencesClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const defaultInterests = { men: false, women: false };
  const defaultStyles = { traditional: false, minimal: false, wedding: false, festive: false, casual: false };
  const defaultColors = { gold: false, black: false, maroon: false, blue: false, cream: false };

  const [interests, setInterests] = useState(initialData?.interests || defaultInterests);
  const [styles, setStyles] = useState(initialData?.styles || defaultStyles);
  const [colors, setColors] = useState(initialData?.colors || defaultColors);

  const handleSave = async () => {
    setLoading(true);
    const data = JSON.stringify({ interests, styles, colors });
    const res = await updatePreferences(data);
    setLoading(false);
    if (res?.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } else {
      alert(res?.error || "Failed to update preferences");
    }
  };

  return (
    <div className="space-y-12 max-w-3xl relative">
      {success && (
        <div className="absolute -top-16 right-0 bg-green-50 text-green-700 px-4 py-2 text-sm flex items-center gap-2 border border-green-200 shadow-sm animate-in fade-in slide-in-from-top-2 z-10">
          <Check className="w-4 h-4" /> Preferences saved
        </div>
      )}
      <div className="border-b border-black/5 pb-4">
        <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-brand-900)] mb-2">My Preferences</h1>
        <p className="text-gray-600">Tell us what you love, and we'll personalize your Fashion Feet experience.</p>
      </div>

      <div className="space-y-10">
        
        {/* Interests Section */}
        <section>
          <h2 className="font-serif text-2xl text-[var(--color-brand-900)] mb-6">I'm interested in</h2>
          <div className="flex gap-4">
            <label className={`flex items-center justify-center px-8 py-4 border cursor-pointer transition-all ${interests.men ? 'border-[var(--color-brand-900)] bg-[var(--color-brand-50)] text-[var(--color-brand-900)]' : 'border-black/10 bg-white text-gray-500 hover:border-black/30'}`}>
              <input type="checkbox" className="hidden" checked={interests.men} onChange={() => setInterests({...interests, men: !interests.men})} />
              <span className="font-medium uppercase tracking-widest text-sm">Men's Juttis</span>
            </label>
            <label className={`flex items-center justify-center px-8 py-4 border cursor-pointer transition-all ${interests.women ? 'border-[var(--color-brand-900)] bg-[var(--color-brand-50)] text-[var(--color-brand-900)]' : 'border-black/10 bg-white text-gray-500 hover:border-black/30'}`}>
              <input type="checkbox" className="hidden" checked={interests.women} onChange={() => setInterests({...interests, women: !interests.women})} />
              <span className="font-medium uppercase tracking-widest text-sm">Women's Juttis</span>
            </label>
          </div>
        </section>

        {/* Style Section */}
        <section>
          <h2 className="font-serif text-2xl text-[var(--color-brand-900)] mb-6">My Style</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(styles).map(([key, value]) => (
              <label key={key} className={`flex items-center gap-3 px-6 py-3 border cursor-pointer transition-all ${value ? 'border-[var(--color-brand-900)] bg-white text-[var(--color-brand-900)]' : 'border-black/10 bg-white text-gray-500 hover:border-black/30'}`}>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[var(--color-brand-900)] border-black/20 rounded-sm focus:ring-[var(--color-accent-gold)]" 
                  checked={value as boolean} 
                  onChange={() => setStyles({...styles, [key]: !value})} 
                />
                <span className="font-medium capitalize text-sm">{key}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Colors Section */}
        <section>
          <h2 className="font-serif text-2xl text-[var(--color-brand-900)] mb-6">Colors I Love</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(colors).map(([key, value]) => {
              const bgColors: any = { gold: "bg-yellow-500", black: "bg-black", maroon: "bg-red-900", blue: "bg-blue-800", cream: "bg-[#f5f5dc]" };
              return (
                <label key={key} className={`relative flex items-center justify-center w-14 h-14 rounded-full cursor-pointer transition-transform hover:scale-110 ${value ? 'ring-2 ring-offset-2 ring-[var(--color-brand-900)]' : 'ring-1 ring-black/10'}`}>
                  <input type="checkbox" className="hidden" checked={value as boolean} onChange={() => setColors({...colors, [key]: !value})} />
                  <div className={`w-12 h-12 rounded-full ${bgColors[key]} flex items-center justify-center`}>
                    {(value as boolean) && <Check className={`w-5 h-5 ${key === 'cream' ? 'text-black' : 'text-white'}`} strokeWidth={3} />}
                  </div>
                </label>
              );
            })}
          </div>
        </section>

      </div>
      
      <div className="pt-8 border-t border-black/5">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-4 bg-[var(--color-brand-900)] text-white font-medium uppercase tracking-widest text-sm hover:bg-[var(--color-accent-gold)] transition-colors disabled:opacity-70 flex items-center justify-center min-w-[200px]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
