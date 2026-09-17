"use client";

import { useState } from "react";
import { Ruler, Sparkles, ArrowRight, CheckCircle2, RotateCw, Save, Check, Info } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { StorefrontTiltCard } from "../storefront/StorefrontTiltCard";
import { updateUserProfile } from "@/app/actions/users";

export function InteractiveSizeFinderSection() {
  const { data: session } = useSession();
  const [gender, setGender] = useState<"women" | "men">("women");
  const [footLengthCm, setFootLengthCm] = useState(24.5);
  const [isFlipped, setIsFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Size calculations based on gender
  const baseOffset = gender === "women" ? 21 : 22;
  const ukSize = Math.max(3, Math.min(12, Math.round((footLengthCm - baseOffset) * 1.3)));
  const euSize = Math.max(35, Math.min(46, Math.round(footLengthCm + 15)));
  const usSize = Math.max(4, Math.min(13, gender === "women" ? ukSize + 2 : ukSize + 1));
  const indiaSize = ukSize; // India size matches UK standard

  const handleSliderChange = (val: number) => {
    setFootLengthCm(val);
    setIsFlipped(true);
    setTimeout(() => setIsFlipped(false), 400);
  };

  const handleSaveSize = async () => {
    if (!session?.user) {
      alert("Please sign into your customer profile to save your footwear size.");
      return;
    }

    setSaving(true);
    const sizeStr = `UK ${ukSize} / EU ${euSize} (${gender === 'women' ? "Women" : "Men"})`;
    const res = await updateUserProfile({ size: sizeStr });
    setSaving(false);

    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <section className="py-24 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="bg-[var(--theme-color-surface)] rounded-3xl p-6 md:p-12 border border-[var(--theme-color-border)] shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Information & Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-color-bg)] text-[var(--theme-color-accent)] rounded-full text-xs uppercase tracking-widest font-bold border border-[var(--theme-color-border)] shadow-sm">
              <Ruler className="w-4 h-4 text-[var(--theme-color-accent)]" />
              <span>Interactive Size & Fitting Studio</span>
            </div>

            <h2 className="font-serif text-3xl md:text-5xl font-bold leading-tight text-[var(--theme-color-text)]">
              Discover Your Perfect Handcrafted Fit
            </h2>

            <p className="text-[var(--theme-color-text-muted)] text-sm md:text-base leading-relaxed font-light">
              Because genuine Punjabi leather footwear molds naturally to your foot over time, finding the right starting size ensures royal comfort from day one.
            </p>

            {/* Gender Toggle Selector */}
            <div className="flex items-center gap-3 bg-[var(--theme-color-bg)] p-1.5 rounded-2xl border border-[var(--theme-color-border)] w-fit">
              <button
                type="button"
                onClick={() => { setGender("women"); setFootLengthCm(24.5); }}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  gender === "women"
                    ? "bg-[var(--theme-color-jewel)] text-white shadow-md"
                    : "text-[var(--theme-color-text-muted)] hover:text-[var(--theme-color-text)]"
                }`}
              >
                Women&apos;s Sizing
              </button>
              <button
                type="button"
                onClick={() => { setGender("men"); setFootLengthCm(26.5); }}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  gender === "men"
                    ? "bg-[var(--theme-color-jewel)] text-white shadow-md"
                    : "text-[var(--theme-color-text-muted)] hover:text-[var(--theme-color-text)]"
                }`}
              >
                Men&apos;s Sizing
              </button>
            </div>

            {/* Interactive Foot Length Slider */}
            <div className="space-y-4 bg-[var(--theme-color-bg)] p-6 rounded-2xl border border-[var(--theme-color-border)]">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="uppercase tracking-widest text-[var(--theme-color-text-muted)]">Foot Length (CM)</span>
                <span className="font-mono text-lg font-bold text-[var(--theme-color-accent)]">{footLengthCm} cm</span>
              </div>

              <input
                type="range"
                min={gender === "women" ? "21.5" : "24"}
                max={gender === "women" ? "27.5" : "30.5"}
                step="0.5"
                value={footLengthCm}
                onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[var(--theme-color-jewel)]"
              />

              {/* Size Conversion Matrix Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2 [perspective:1000px]">
                <div className={`bg-[var(--theme-color-surface)] p-3 rounded-xl border border-[var(--theme-color-border)] shadow-sm space-y-0.5 transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                  <span className="text-[10px] text-[var(--theme-color-text-muted)] uppercase tracking-widest font-bold">UK Size</span>
                  <p className="text-xl font-serif font-bold text-[var(--theme-color-text)]">UK {ukSize}</p>
                </div>

                <div className={`bg-[var(--theme-color-surface)] p-3 rounded-xl border border-[var(--theme-color-border)] shadow-sm space-y-0.5 transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                  <span className="text-[10px] text-[var(--theme-color-text-muted)] uppercase tracking-widest font-bold">India Size</span>
                  <p className="text-xl font-serif font-bold text-[var(--theme-color-text)]">IND {indiaSize}</p>
                </div>

                <div className={`bg-[var(--theme-color-surface)] p-3 rounded-xl border border-[var(--theme-color-border)] shadow-sm space-y-0.5 transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                  <span className="text-[10px] text-[var(--theme-color-text-muted)] uppercase tracking-widest font-bold">EU Size</span>
                  <p className="text-xl font-serif font-bold text-[var(--theme-color-text)]">EU {euSize}</p>
                </div>

                <div className={`bg-[var(--theme-color-surface)] p-3 rounded-xl border border-[var(--theme-color-border)] shadow-sm space-y-0.5 transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                  <span className="text-[10px] text-[var(--theme-color-text-muted)] uppercase tracking-widest font-bold">US Size</span>
                  <p className="text-xl font-serif font-bold text-[var(--theme-color-text)]">US {usSize}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/shop?category=${gender === 'women' ? 'Women' : 'Men'}&size=${ukSize}`}
                className="px-6 py-3.5 bg-[var(--theme-color-jewel)] text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-colors rounded-xl shadow-lg flex items-center gap-2 border border-[var(--theme-color-border)]"
              >
                Browse UK {ukSize} {gender === 'women' ? "Women's" : "Men's"} Pairs <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleSaveSize}
                disabled={saving}
                className="px-5 py-3.5 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] text-xs font-bold uppercase tracking-widest hover:border-[var(--theme-color-accent)] transition-all rounded-xl border border-[var(--theme-color-border)] flex items-center gap-2 shadow-sm"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4 text-[var(--theme-color-accent)]" />}
                {savedSuccess ? "Size Saved to Account!" : "Save Size to Account"}
              </button>
            </div>
          </div>

          {/* Right Column: Visual Foot Diagram & Fit Advice */}
          <div className="lg:col-span-5">
            <StorefrontTiltCard className="bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] p-8 rounded-2xl shadow-xl space-y-6 border border-[var(--theme-color-border)]">
              <div className="flex items-center justify-between border-b border-[var(--theme-color-border)] pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--theme-color-accent)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Fashion Feet Fit Advisor
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Recommended Fit
                </span>
              </div>

              {/* Visual Diagram */}
              <div className="h-40 bg-[var(--theme-color-bg)] rounded-xl border border-[var(--theme-color-border)] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="text-center space-y-1">
                  <span className="text-5xl">🦶</span>
                  <p className="font-serif text-sm font-bold text-[var(--theme-color-text)]">Recommended Size: UK {ukSize} / EU {euSize}</p>
                  <p className="text-[11px] text-[var(--theme-color-text-muted)] font-medium">Anatomical fit suited for Punjabi Juttis ({footLengthCm} cm)</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[var(--theme-color-text-muted)]">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Genuine leather naturally molds to the shape of your feet over time.</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cushioned arch support provides immediate heel comfort during ceremonies and long events.</span>
                </p>
                <div className="p-3 bg-amber-500/10 text-amber-900 rounded-xl border border-amber-500/20 flex items-start gap-2 text-[11px]">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Handmade Disclaimer:</strong> As each Jutti is handcrafted, fit may vary slightly by design.</span>
                </div>
              </div>
            </StorefrontTiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
