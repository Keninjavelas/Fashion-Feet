"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATALOGUES, catalogueHref } from "@/lib/catalogues";

export function CollectionsMegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-full left-0 z-50 w-full border-b border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] py-8 text-[var(--theme-color-text)] shadow-2xl">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold">Shop by catalogue</h2>
          <Link href="/shop" onClick={onClose} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--theme-color-jewel)] hover:underline">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {CATALOGUES.map((catalogue) => (
            <div key={catalogue.slug} className="rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-bg)] p-5">
              <Link href={catalogueHref(catalogue.slug)} onClick={onClose} className="font-serif text-xl font-bold hover:text-[var(--theme-color-accent)]">{catalogue.name}</Link>
              <div className="mt-4 flex gap-2">
                {catalogue.slug !== "rajwadi" && <Link href={catalogueHref(catalogue.slug, "Men")} onClick={onClose} className="rounded-full border border-[var(--theme-color-border)] px-4 py-2 text-xs font-bold hover:border-[var(--theme-color-accent)]">Men</Link>}
                <Link href={catalogueHref(catalogue.slug, "Women")} onClick={onClose} className="rounded-full border border-[var(--theme-color-border)] px-4 py-2 text-xs font-bold hover:border-[var(--theme-color-accent)]">Women</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
