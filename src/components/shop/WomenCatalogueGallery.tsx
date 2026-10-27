import Image from "next/image";
import Link from "next/link";
import { CATALOGUES } from "@/lib/catalogues";

const PHOTO_NUMBERS: Record<string, readonly number[]> = {
  "daily-wear": [1, 2, 3, 4, 5, 6, 7],
  // Photograph 7 is byte-for-byte identical to photograph 5. Both source files
  // are retained in the project, but the gallery shows that design once.
  festive: [1, 2, 3, 4, 5, 6, 8, 9],
  ceremonial: [1, 2, 3, 4, 5],
};

export function WomenCatalogueGallery({ selectedCatalogue }: { selectedCatalogue?: string }) {
  const groups = CATALOGUES.filter((catalogue) => !selectedCatalogue || catalogue.slug === selectedCatalogue);

  return (
    <div className="space-y-12" aria-label="Women's footwear photo previews">
      <div className="rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] p-5 text-[var(--theme-color-text)]">
        <h2 className="font-serif text-2xl font-bold">Women&apos;s footwear photo previews</h2>
        <p className="mt-2 text-sm text-[var(--theme-color-text-muted)]">
          These are photographs of Fashion Feet designs. Individual product names, prices, sizes, and availability will appear when confirmed. Quote the catalogue and photo number when contacting us about a pair.
        </p>
        <Link href="/contact" className="mt-4 inline-flex rounded-full bg-[var(--theme-color-jewel)] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90">Ask about a pictured pair</Link>
      </div>

      {groups.map((catalogue) => (
        <section key={catalogue.slug} aria-labelledby={`gallery-${catalogue.slug}`} className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h3 id={`gallery-${catalogue.slug}`} className="font-serif text-2xl font-bold text-inherit">{catalogue.name}</h3>
            <span className="text-xs opacity-70">{PHOTO_NUMBERS[catalogue.slug].length} photos</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {PHOTO_NUMBERS[catalogue.slug].map((number) => {
              const label = `${catalogue.name} photo ${String(number).padStart(2, "0")}`;
              return (
                <figure key={number} className="overflow-hidden rounded-xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)]">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={`/catalogue/women/${catalogue.slug}/${String(number).padStart(2, "0")}.jpeg`}
                      alt={`Women's footwear, ${label}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain"
                    />
                  </div>
                  <figcaption className="border-t border-[var(--theme-color-border)] px-3 py-2 text-xs font-medium text-[var(--theme-color-text-muted)]">{label}</figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
