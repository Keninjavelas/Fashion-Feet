import Image from "next/image";
import Link from "next/link";
import { CATALOGUES } from "@/lib/catalogues";

const DESIGNS: Record<(typeof CATALOGUES)[number]["slug"], readonly { number: number; name: string }[]> = {
  "daily-wear": [
    { number: 1, name: "Chestnut Lattice" },
    { number: 2, name: "Copper Sunray" },
    { number: 3, name: "Sienna Bloom" },
    { number: 4, name: "Russet Rays" },
    { number: 5, name: "Cinnamon Floral" },
    { number: 6, name: "Amber Mosaic" },
    { number: 7, name: "Golden Meadow" },
  ],
  // Photograph 7 is byte-for-byte identical to photograph 5. Both source files
  // are retained in the project, but the gallery shows that design once.
  festive: [
    { number: 1, name: "Rose Lattice" },
    { number: 2, name: "Rainbow Medallion" },
    { number: 3, name: "Carnival Geometry" },
    { number: 4, name: "Fuchsia Sparkle" },
    { number: 5, name: "Spring Blossoms" },
    { number: 6, name: "Crimson Eclipse" },
    { number: 8, name: "Festival Threads" },
    { number: 9, name: "Fuchsia Mosaic" },
  ],
  ceremonial: [
    { number: 1, name: "Rose Lattice" },
    { number: 2, name: "Gilded Rays" },
    { number: 3, name: "Midnight Spark" },
    { number: 4, name: "Blush Filigree" },
    { number: 5, name: "Golden Constellation" },
  ],
  rajwadi: [
    { number: 1, name: "Sunflower Beads" },
    { number: 2, name: "Marigold Medallions" },
    { number: 3, name: "Carved Floral Duo" },
    { number: 4, name: "Silver Ribbon" },
    { number: 5, name: "Colourful Medallions" },
    { number: 6, name: "Shell Blossoms" },
    { number: 7, name: "Bright Mosaic" },
  ],
};

export function WomenCatalogueGallery({ selectedCatalogue }: { selectedCatalogue?: string }) {
  const groups = CATALOGUES.filter((catalogue) => !selectedCatalogue || catalogue.slug === selectedCatalogue);

  return (
    <div className="space-y-12" aria-label="Women's footwear photo previews">
      <div className="rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] p-5 text-[var(--theme-color-text)]">
        <h2 className="font-serif text-2xl font-bold">Explore the designs</h2>
        <p className="mt-2 text-sm text-[var(--theme-color-text-muted)]">
          Each preview has a name inspired by its appearance. Open the original photo to inspect exact details. Prices, sizes, and availability will appear when confirmed. Mention the collection and design name when contacting us about a pair.
        </p>
        <Link href="/contact" className="mt-4 inline-flex rounded-full bg-[var(--theme-color-jewel)] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90">Ask about a pictured pair</Link>
      </div>

      {groups.map((catalogue) => (
        <section key={catalogue.slug} aria-labelledby={`gallery-${catalogue.slug}`} className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h3 id={`gallery-${catalogue.slug}`} className="font-serif text-2xl font-bold text-inherit">{catalogue.name}</h3>
            <span className="text-xs opacity-70">{DESIGNS[catalogue.slug].length} designs</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {DESIGNS[catalogue.slug].map(({ number, name }) => {
              const photoNumber = String(number).padStart(2, "0");
              const originalSrc = `/catalogue/women/${catalogue.slug}/${photoNumber}.jpeg`;
              const studioFolder = catalogue.slug === "daily-wear"
                ? catalogue.slug
                : catalogue.slug === "rajwadi"
                  ? catalogue.slug
                : catalogue.slug === "ceremonial" && (number === 1 || number === 5)
                  ? "ceremonial-v3"
                  : `${catalogue.slug}-v2`;
              return (
                <figure key={number} className="overflow-hidden rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] shadow-sm">
                  <a
                    href={originalSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View original photograph of ${catalogue.name} design ${name}`}
                    className="group block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--theme-color-accent)]"
                  >
                    <div className="catalogue-photo-stage">
                      <div className="absolute inset-[8%] z-10 transition-transform duration-300 group-hover:scale-[1.03]">
                        <Image
                          src={`/catalogue/women/studio/${studioFolder}/${photoNumber}.png`}
                          alt={`${name} women's ${catalogue.slug === "rajwadi" ? "toe-loop sandals" : "juttis"}${catalogue.slug === "rajwadi" && number === 3 ? " in two colour variants" : ""}${catalogue.slug === "ceremonial" && number === 5 ? ", reconstructed from a close-up photograph" : ""}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="catalogue-photo-image"
                        />
                      </div>
                      {catalogue.slug === "ceremonial" && number === 5 && (
                        <span className="absolute left-3 top-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#4a3529]">Reconstructed preview</span>
                      )}
                    </div>
                    <figcaption className="flex min-h-14 items-center justify-between gap-2 border-t border-[var(--theme-color-border)] px-3 py-2">
                      <span className="font-serif text-sm font-bold leading-tight text-[var(--theme-color-text)]">{name}</span>
                      <span className="shrink-0 text-xs font-semibold text-[var(--theme-color-jewel)] underline-offset-2 group-hover:underline">Original</span>
                    </figcaption>
                  </a>
                </figure>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
