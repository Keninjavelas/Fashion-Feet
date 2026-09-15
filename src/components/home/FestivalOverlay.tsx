"use client";

import { Sparkles, X, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function FestivalOverlay({ activeFestival }: { activeFestival?: any }) {
  const [dismissed, setDismissed] = useState(false);

  if (!activeFestival || dismissed) return null;

  const accentColor = activeFestival.accentColor || "#D4AF37";
  const showAnnouncement = activeFestival.announcementActive !== false;

  return (
    <div className="relative z-40">
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
    </div>
  );
}
