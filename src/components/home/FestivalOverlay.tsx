"use client";

import { Sparkles, X, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function FestivalOverlay({ activeFestival }: { activeFestival?: any }) {
  const [dismissed, setDismissed] = useState(false);

  if (!activeFestival || dismissed) return null;

  const accentColor = activeFestival.accentColor || "#D4AF37";
  const showAnnouncement = activeFestival.announcementActive !== false;
  const glowOpacity = activeFestival.effectIntensity === "VIBRANT" ? 0.42 : activeFestival.effectIntensity === "SUBTLE" ? 0.12 : 0.26;

  return (
    <div className="relative z-40" data-festival-animation={activeFestival.animation || "none"}>
      {/* Top Festival Takeover Announcement Marquee Bar */}
      {showAnnouncement && activeFestival.announcement && (
        <div
          className="py-2.5 px-4 text-center text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 relative shadow-md transition-all"
          style={{ backgroundColor: accentColor }}
        >
          <Sparkles className="w-4 h-4 animate-spin shrink-0" />
          <span className="truncate">{activeFestival.announcement}</span>
          
          {activeFestival.offerHeading && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-black/40 border border-white/20 px-2 py-0.5 rounded-full text-[10px] text-white">
              <Tag className="w-3 h-3 text-[#D4AF37]" /> {activeFestival.offerHeading}
            </span>
          )}

          <Link href="/festive" className="underline hover:text-black font-bold ml-2 shrink-0">
            {activeFestival.ctaText || "Explore Showcase →"}
          </Link>

          <button
            onClick={() => setDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-1"
            title="Dismiss Announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <section className="relative isolate overflow-hidden bg-[#12080C] px-4 py-12 text-white sm:py-16">
        {activeFestival.heroBanner && <div className="absolute inset-0 -z-10">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={activeFestival.heroBanner} alt="" className="h-full w-full object-cover opacity-30" /></div>}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#12080C] via-[#12080C]/80 to-transparent" />
        <div className="festival-campaign-glow pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: accentColor, opacity: glowOpacity }} />
        <div className="mx-auto max-w-6xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>{activeFestival.badgeText || activeFestival.name}</p>
          <h2 className="max-w-3xl font-serif text-3xl font-bold sm:text-5xl">{activeFestival.offerHeading || activeFestival.name}</h2>
          {activeFestival.heroSubtitle && <p className="max-w-2xl text-lg text-white/85">{activeFestival.heroSubtitle}</p>}
          {activeFestival.offerDescription && <p className="max-w-2xl text-sm text-white/70">{activeFestival.offerDescription}</p>}
          {activeFestival.discountPercentage && <p className="inline-flex rounded-full border border-white/25 px-4 py-2 text-xs font-bold uppercase tracking-widest">{activeFestival.discountPercentage}% boutique consultation offer</p>}
          <div><Link href="/festive" className="inline-flex rounded-lg bg-[#8A1538] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white">{activeFestival.ctaText || "Explore Festive Collection"}</Link></div>
        </div>
      </section>
    </div>
  );
}
