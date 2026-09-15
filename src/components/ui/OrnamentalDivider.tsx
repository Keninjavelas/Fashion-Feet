"use client";

import { Sparkles } from "lucide-react";
import { useFestival } from "@/components/providers/FestivalProvider";

export function OrnamentalDivider() {
  const { preset } = useFestival();

  // Conditionally mount ONLY when ornamentDividersEnabled decoration flag is true
  if (!preset.decorations.ornamentDividersEnabled) return null;

  return (
    <div className="py-6 flex items-center justify-center gap-4 max-w-4xl mx-auto px-4 opacity-80">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--theme-color-accent)]/40 to-[var(--theme-color-accent)]" />
      <div className="w-8 h-8 rounded-full border border-[var(--theme-color-accent)]/50 flex items-center justify-center text-[var(--theme-color-accent)] bg-[var(--theme-color-surface)] shadow-lg">
        <Sparkles className="w-4 h-4 text-[var(--theme-color-accent)]" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--theme-color-accent)]/40 to-[var(--theme-color-accent)]" />
    </div>
  );
}
