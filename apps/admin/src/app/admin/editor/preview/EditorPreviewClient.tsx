"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { StorefrontSection, DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/storefrontConfigTypes";
import { getSeasonalAtmosphere } from "@/lib/seasonalConstants";
import { Sparkles, ArrowRight, ShieldCheck, MapPin, ShoppingBag, Eye } from "lucide-react";

function EditorPreviewContent() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "homepage";
  const season = searchParams.get("season") || "default";

  const [sections, setSections] = useState<StorefrontSection[]>(DEFAULT_HOMEPAGE_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  useEffect(() => {
    // Listen for live update messages from parent editor window
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type === "STOREFRONT_EDITOR_UPDATE" && event.data.sections) {
        setSections(event.data.sections);
      }
      if (event.data?.type === "STOREFRONT_EDITOR_SELECT_SECTION") {
        setSelectedSectionId(event.data.sectionId);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Seasonal atmosphere styling classes
  const getSeasonalBgClass = () => {
    return getSeasonalAtmosphere(season).bgClass;
  };

  const sortedSections = [...sections].filter((s) => s.visible).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${getSeasonalBgClass()}`}>
      {/* Seasonal Atmosphere Banner Preview Badge */}
      {season !== "default" && (
        <div className="py-2 bg-[#D4AF37]/20 border-b border-[#D4AF37]/30 text-center text-xs font-bold uppercase tracking-widest text-[#D4AF37] flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Previewing Seasonal Experience: <span className="capitalize">{season}</span>
        </div>
      )}

      {/* Render Dynamic Storefront Sections */}
      <div className="space-y-12">
        {sortedSections.map((sec) => {
          const isSelected = selectedSectionId === sec.id;

          return (
            <div
              key={sec.id}
              onClick={() => {
                window.parent.postMessage({ type: "STOREFRONT_CANVAS_SELECT_SECTION", sectionId: sec.id }, window.location.origin);
              }}
              className={`relative transition-all cursor-pointer ${
                isSelected ? "ring-2 ring-[#D4AF37] ring-offset-4 ring-offset-black" : "hover:outline hover:outline-1 hover:outline-white/30"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 left-2 z-20 px-2.5 py-1 bg-[#8A1538] text-[#D4AF37] border border-[#D4AF37]/40 text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-lg flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Selected Section ({sec.type})
                </div>
              )}

              {/* HERO_BANNER Section */}
              {sec.type === "HERO_BANNER" && (
                <section className="relative min-h-[500px] flex items-center justify-center p-8 sm:p-16 overflow-hidden">
                  {sec.image && (
                    <div className="absolute inset-0 z-0 opacity-40">
                      <Image src={sec.image} alt={sec.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    </div>
                  )}

                  <div className="relative z-10 max-w-3xl text-center space-y-4">
                    {sec.badge && (
                      <span className="px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest rounded-full inline-block">
                        {sec.badge}
                      </span>
                    )}
                    <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">{sec.title}</h1>
                    {sec.subtitle && <p className="text-sm sm:text-lg text-white/80 font-medium">{sec.subtitle}</p>}
                    {sec.description && <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto">{sec.description}</p>}
                    {sec.ctaText && (
                      <div className="pt-4">
                        <span className="px-6 py-3 bg-[#8A1538] hover:bg-[#A81B45] text-white border border-[#D4AF37]/40 text-xs font-bold uppercase tracking-widest rounded-xl inline-flex items-center gap-2 shadow-lg">
                          {sec.ctaText} <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* FEATURED_COLLECTIONS Section */}
              {sec.type === "FEATURED_COLLECTIONS" && (
                <section className="p-8 sm:p-12 max-w-6xl mx-auto space-y-6">
                  <div className="text-center space-y-2">
                    {sec.badge && <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{sec.badge}</span>}
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">{sec.title}</h2>
                    {sec.subtitle && <p className="text-xs text-white/70">{sec.subtitle}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {["Wedding Mojaris", "Festive Silk Juttis", "Everyday Casual"].map((colTitle, idx) => (
                      <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2 hover:border-[#D4AF37]/40 transition-all">
                        <span className="text-xs font-serif font-bold text-white block">{colTitle}</span>
                        <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider block">Explore Collection &rarr;</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* CRAFTSMANSHIP_HERITAGE Section */}
              {sec.type === "CRAFTSMANSHIP_HERITAGE" && (
                <section className="p-8 sm:p-12 max-w-6xl mx-auto bg-white/5 border border-white/10 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    {sec.badge && <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{sec.badge}</span>}
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">{sec.title}</h2>
                    {sec.subtitle && <p className="text-sm font-semibold text-[#D4AF37]">{sec.subtitle}</p>}
                    {sec.description && <p className="text-xs text-white/70 leading-relaxed">{sec.description}</p>}
                    {sec.ctaText && (
                      <span className="px-5 py-2.5 bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-xl inline-block border border-white/20">
                        {sec.ctaText}
                      </span>
                    )}
                  </div>

                  {sec.image && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
                      <Image src={sec.image} alt={sec.title} fill className="object-cover" />
                    </div>
                  )}
                </section>
              )}

              {/* TRENDING_DESIGNS Section */}
              {sec.type === "TRENDING_DESIGNS" && (
                <section className="p-8 sm:p-12 max-w-6xl mx-auto space-y-6">
                  <div className="space-y-1">
                    {sec.badge && <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{sec.badge}</span>}
                    <h2 className="font-serif text-2xl font-bold text-white">{sec.title}</h2>
                    {sec.subtitle && <p className="text-xs text-white/70">{sec.subtitle}</p>}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    {["Zardozi Royal Mojari", "Ruby Dabka Jutti", "Mirrored Empress", "Groom Gold Sherwani"].map((pName, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                        <div className="aspect-square bg-white/10 rounded-xl relative overflow-hidden">
                          <ShoppingBag className="w-6 h-6 text-[#D4AF37] absolute inset-0 m-auto" />
                        </div>
                        <span className="font-bold text-white block">{pName}</span>
                        <span className="font-mono text-[#D4AF37] font-bold">₹4,999</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SIZE_STUDIO_PROMO Section */}
              {sec.type === "SIZE_STUDIO_PROMO" && (
                <section className="p-8 max-w-4xl mx-auto text-center space-y-3 bg-[#8A1538]/30 border border-[#D4AF37]/30 rounded-3xl">
                  {sec.badge && <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{sec.badge}</span>}
                  <h2 className="font-serif text-2xl font-bold text-white">{sec.title}</h2>
                  {sec.subtitle && <p className="text-xs text-white/80">{sec.subtitle}</p>}
                  {sec.description && <p className="text-xs text-white/60 max-w-md mx-auto">{sec.description}</p>}
                </section>
              )}

              {/* STORES_PROMO Section */}
              {sec.type === "STORES_PROMO" && (
                <section className="p-8 max-w-4xl mx-auto text-center space-y-3 bg-white/5 border border-white/10 rounded-3xl">
                  {sec.badge && <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{sec.badge}</span>}
                  <h2 className="font-serif text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5 text-[#8A1538]" /> {sec.title}
                  </h2>
                  {sec.subtitle && <p className="text-xs text-white/70">{sec.subtitle}</p>}
                </section>
              )}

              {sec.type === "GLOBAL_FOOTER" && (
                <footer className="bg-[#12080C] p-8 text-white sm:p-12">
                  {sec.badge && <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">{sec.badge}</p>}
                  <h2 className="font-serif text-3xl font-bold">{sec.title}</h2>
                  {sec.subtitle && <p className="mt-3 text-sm text-white/75">{sec.subtitle}</p>}
                  {sec.description && <p className="mt-6 max-w-xl text-xs text-white/60">{sec.description}</p>}
                  {sec.ctaText && <span className="mt-6 inline-flex rounded-lg border border-[#D4AF37]/40 px-4 py-2 text-xs font-bold text-[#D4AF37]">{sec.ctaText}</span>}
                </footer>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EditorPreviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white font-sans text-xs">Loading Editor Canvas...</div>}>
      <EditorPreviewContent />
    </Suspense>
  );
}
