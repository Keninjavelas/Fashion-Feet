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
          These studio-style previews are based on Fashion Feet photographs. Open an original photo to inspect exact details. Individual product names, prices, sizes, and availability will appear when confirmed. Quote the catalogue and photo number when contacting us about a pair.
        </p>
        <Link href="/contact" className="mt-4 inline-flex rounded-full bg-[var(--theme-color-jewel)] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90">Ask about a pictured pair</Link>
      </div>

      {groups.map((catalogue) => (
        <section key={catalogue.slug} aria-labelledby={`gallery-${catalogue.slug}`} className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h3 id={`gallery-${catalogue.slug}`} className="font-serif text-2xl font-bold text-inherit">{catalogue.name}</h3>
            <span className="text-xs opacity-70">{PHOTO_NUMBERS[catalogue.slug].length} photos</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {PHOTO_NUMBERS[catalogue.slug].filter((number) => catalogue.slug !== "ceremonial" || number !== 5).map((number) => {
              const photoNumber = String(number).padStart(2, "0");
              const label = `${catalogue.name} photo ${photoNumber}`;
              const originalSrc = `/catalogue/women/${catalogue.slug}/${photoNumber}.jpeg`;
              const studioFolder = catalogue.slug === "daily-wear" ? catalogue.slug : `${catalogue.slug}-v2`;
              return (
                <figure key={number} className="overflow-hidden rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] shadow-sm">
                  <a
                    href={originalSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View original photograph for ${label}`}
                    className="group block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--theme-color-accent)]"
                  >
                    <div className="catalogue-photo-stage">
                      <div className="absolute inset-[8%] z-10 transition-transform duration-300 group-hover:scale-[1.03]">
                        <Image
                          src={`/catalogue/women/studio/${studioFolder}/${photoNumber}.png`}
                          alt={`Women's footwear, ${label}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="catalogue-photo-image"
                        />
                      </div>
                    </div>
                    <figcaption className="flex min-h-12 items-center justify-between gap-2 border-t border-[var(--theme-color-border)] px-3 py-2 text-xs font-medium text-[var(--theme-color-text-muted)]">
                      <span>{label}</span>
                      <span className="shrink-0 text-[10px] text-[var(--theme-color-accent)] underline-offset-2 group-hover:underline">Original</span>
                    </figcaption>
                  </a>
                </figure>
              );
            })}
          </div>
          {catalogue.slug === "ceremonial" && (
            <a
              href="/catalogue/women/ceremonial/05.jpeg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View original ceremonial close-up photograph 05"
              className="group grid overflow-hidden rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] shadow-sm sm:grid-cols-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-color-accent)]"
            >
              <div className="catalogue-photo-stage min-h-64 sm:aspect-auto">
                <div className="absolute inset-[12%] z-10 transition-transform duration-300 group-hover:scale-[1.03]">
                  <Image
                    src="/catalogue/women/studio/ceremonial/05.png"
                    alt="Close-up of gold ceremonial footwear decoration"
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="catalogue-photo-image"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center gap-3 p-5 sm:p-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--theme-color-accent)]">Ceremonial photo 05 · Detail view</span>
                <h4 className="font-serif text-xl font-bold sm:text-2xl">A closer look at the decoration</h4>
                <p className="text-sm text-[var(--theme-color-text-muted)]">The supplied photo shows part of the pair up close. Open the original to inspect the beadwork and stones.</p>
                <span className="text-xs font-bold text-[var(--theme-color-accent)] underline-offset-4 group-hover:underline">View original photo</span>
              </div>
            </a>
          )}
        </section>
      ))}
    </div>
  );
}
