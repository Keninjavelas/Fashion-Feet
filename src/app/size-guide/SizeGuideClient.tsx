"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { updateSize } from "../profile/actions";

type Tab = "Women" | "Men" | "Kids";

const sizeData = {
  Women: [
    { us: "5", uk: "3", eu: "35", footLength: "22.5 cm" },
    { us: "6", uk: "4", eu: "36", footLength: "23.5 cm" },
    { us: "7", uk: "5", eu: "37", footLength: "24.0 cm" },
    { us: "8", uk: "6", eu: "38", footLength: "25.0 cm" },
    { us: "9", uk: "7", eu: "39", footLength: "26.0 cm" },
    { us: "10", uk: "8", eu: "40", footLength: "27.0 cm" },
  ],
  Men: [
    { us: "7", uk: "6", eu: "40", footLength: "25.0 cm" },
    { us: "8", uk: "7", eu: "41", footLength: "26.0 cm" },
    { us: "9", uk: "8", eu: "42", footLength: "26.5 cm" },
    { us: "10", uk: "9", eu: "43", footLength: "27.5 cm" },
    { us: "11", uk: "10", eu: "44", footLength: "28.0 cm" },
    { us: "12", uk: "11", eu: "45", footLength: "29.0 cm" },
  ],
  Kids: [
    { us: "1", uk: "13", eu: "32", footLength: "20.0 cm" },
    { us: "2", uk: "1", eu: "33", footLength: "21.0 cm" },
    { us: "3", uk: "2", eu: "34", footLength: "21.5 cm" },
    { us: "4", uk: "3", eu: "35", footLength: "22.5 cm" },
  ],
};

export function SizeGuideClient() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("Women");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSize = async (sizeToSave: string) => {
    setIsSaving(true);
    await updateSize(`US ${sizeToSave}`);
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-color-surface)] text-[var(--theme-color-accent)] rounded-full text-xs uppercase tracking-widest font-bold border border-[var(--theme-color-border)] shadow-sm">
            <Ruler className="w-3.5 h-3.5" />
            <span>Handcrafted Fitting Guide</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--theme-color-text)] font-bold tracking-tight">Size & Fitting Studio</h1>
          <p className="text-[var(--theme-color-text-muted)] text-base max-w-xl mx-auto font-light leading-relaxed">
            Find your exact fit. Genuine Punjabi leather footwear molds naturally to your foot over time. If between sizes, we recommend sizing up.
          </p>
        </div>

        {/* Expanded Conversion Table without nested scrollbars */}
        <div className="bg-[var(--theme-color-surface)] p-6 md:p-10 shadow-xl border border-[var(--theme-color-border)] rounded-2xl space-y-6">
          <div className="flex justify-center border-b border-[var(--theme-color-border)] mb-6">
            {(["Women", "Men", "Kids"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 font-serif text-xl md:text-2xl transition-colors relative focus:outline-none ${
                  activeTab === tab ? "text-[var(--theme-color-text)] font-bold" : "text-[var(--theme-color-text-muted)] hover:text-[var(--theme-color-text)]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--theme-color-accent)]" 
                  />
                )}
              </button>
            ))}
          </div>

          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] border-b border-[var(--theme-color-border)]">
                  <th className="py-4 px-6 font-bold uppercase tracking-widest text-xs">US Size</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-widest text-xs">UK Size</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-widest text-xs">EU Size</th>
                  <th className="py-4 px-6 font-bold uppercase tracking-widest text-xs">Foot Length</th>
                  {session?.user && <th className="py-4 px-6 font-bold uppercase tracking-widest text-xs text-right">Action</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {sizeData[activeTab].map((row, idx) => (
                    <motion.tr 
                      key={`${activeTab}-${idx}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className={`border-b border-[var(--theme-color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${selectedSize === row.us ? 'bg-[var(--theme-color-bg)]' : ''}`}
                    >
                      <td className="py-4 px-6 font-bold text-[var(--theme-color-text)]">US {row.us}</td>
                      <td className="py-4 px-6 text-[var(--theme-color-text-muted)] font-medium">UK {row.uk}</td>
                      <td className="py-4 px-6 text-[var(--theme-color-text-muted)] font-medium">EU {row.eu}</td>
                      <td className="py-4 px-6 font-mono text-sm font-bold text-[var(--theme-color-text)]">{row.footLength}</td>
                      {session?.user && (
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => { setSelectedSize(row.us); handleSaveSize(row.us); }}
                            className="text-xs font-bold uppercase tracking-widest text-[var(--theme-color-jewel)] hover:underline focus:outline-none"
                          >
                            {selectedSize === row.us ? (
                              isSaving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : isSaved ? <CheckCircle2 className="w-4 h-4 inline text-emerald-500" /> : "Saved"
                            ) : "Save Size"}
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Measure Section */}
        <div className="bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] p-8 md:p-12 shadow-xl rounded-2xl border border-[var(--theme-color-border)] space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl md:text-4xl font-bold">How to Measure Your Foot</h2>
            <p className="text-[var(--theme-color-text-muted)] max-w-xl mx-auto text-sm font-light">Follow these 3 simple steps to measure your foot length accurately from home.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[var(--theme-color-bg)] border border-[var(--theme-color-border)] flex items-center justify-center shadow">
                <span className="font-serif text-2xl font-bold text-[var(--theme-color-accent)]">1</span>
              </div>
              <h3 className="font-serif font-bold text-base">Trace Your Foot</h3>
              <p className="text-xs text-[var(--theme-color-text-muted)] font-light leading-relaxed">Place a piece of paper on the floor against a wall. Stand on it with your heel against the wall and trace your foot outline.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[var(--theme-color-bg)] border border-[var(--theme-color-border)] flex items-center justify-center shadow">
                <span className="font-serif text-2xl font-bold text-[var(--theme-color-accent)]">2</span>
              </div>
              <h3 className="font-serif font-bold text-base">Measure Heel-to-Toe</h3>
              <p className="text-xs text-[var(--theme-color-text-muted)] font-light leading-relaxed">Using a ruler, measure the distance from your heel edge to the tip of your longest toe.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[var(--theme-color-bg)] border border-[var(--theme-color-border)] flex items-center justify-center shadow">
                <span className="font-serif text-2xl font-bold text-[var(--theme-color-accent)]">3</span>
              </div>
              <h3 className="font-serif font-bold text-base">Find Your Size</h3>
              <p className="text-xs text-[var(--theme-color-text-muted)] font-light leading-relaxed">Compare your foot length (in cm) with our size chart above to select your perfect Jutti size.</p>
            </div>
          </div>
          
          <div className="pt-4 text-center">
             <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--theme-color-jewel)] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg border border-[var(--theme-color-border)]">
               Explore Showroom <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
