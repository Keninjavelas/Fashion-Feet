"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { useFestival } from "@/components/providers/FestivalProvider";

export function AnnouncementMarqueeBar() {
  const [dismissed, setDismissed] = useState(true);
  const { preset } = useFestival();

  useEffect(() => {
    const isDismissed = localStorage.getItem("fashion_feet_announcement_dismissed");
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("fashion_feet_announcement_dismissed", "true");
  };

  // Conditionally render ONLY if announcementEnabled decoration flag is true and not dismissed
  if (!preset.decorations.announcementEnabled || dismissed) return null;

  const items = preset.decorations.announcementMessages;

  return (
    <div className="announcement-marquee bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] py-1.5 border-b border-[var(--theme-color-border)] text-[11px] uppercase font-bold tracking-widest overflow-hidden relative z-50 flex items-center justify-between shadow-sm">
      <div className="flex-1 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-pointer">
          {items.concat(items).map((text, idx) => (
            <div key={idx} className="flex items-center gap-6 mx-6 shrink-0">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--theme-color-accent)]" />
                <span>{text}</span>
              </span>
              <span className="text-[var(--theme-color-accent)] opacity-60">•</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="p-1.5 px-3 bg-[var(--theme-color-surface)] text-[var(--theme-color-text-muted)] hover:text-[var(--theme-color-accent)] transition-colors flex-shrink-0 z-10 border-l border-[var(--theme-color-border)] focus:outline-none"
        aria-label="Close Announcement Bar"
        title="Dismiss Announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
