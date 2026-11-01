import Image from "next/image";
import Link from "next/link";

const DESIGNS = [
  { number: 1, name: "Midnight Vine" },
  { number: 2, name: "Crimson Roses" },
  { number: 3, name: "Navy Starflower" },
  { number: 4, name: "Emerald Leaves" },
  { number: 5, name: "Midnight Pearls" },
] as const;

export function MenCatalogueGallery({ selectedCatalogue }: { selectedCatalogue?: string }) {
  if (selectedCatalogue && selectedCatalogue !== "functional") return null;

  return (
    <div className="space-y-12" aria-label="Men's footwear photo previews">
      <div className="rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] p-5 text-[var(--theme-color-text)]">
        <h2 className="font-serif text-2xl font-bold">Explore the designs</h2>
        <p className="mt-2 text-sm text-[var(--theme-color-text-muted)]">
          Five individual juttis appear in the original Functional collection photograph. These previews are edited cutouts; open the full photograph to inspect the source. Names describe their appearance. Ask us to confirm price, size, and availability.
        </p>
        <Link href="/contact" className="mt-4 inline-flex rounded-full bg-[var(--theme-color-jewel)] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90">Ask about a pictured jutti</Link>
      </div>

      <section aria-labelledby="gallery-functional" className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h3 id="gallery-functional" className="font-serif text-2xl font-bold text-inherit">Functional</h3>
          <span className="text-xs opacity-70">{DESIGNS.length} designs</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {DESIGNS.map(({ number, name }) => (
            <figure key={number} className="overflow-hidden rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] shadow-sm">
              <a
                href="/catalogue/men/functional/group.jpeg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View the original group photograph featuring ${name}`}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--theme-color-accent)]"
              >
                <div className="catalogue-photo-stage">
                  <div className="absolute inset-[8%] z-10 transition-transform duration-300 group-hover:scale-[1.03]">
                    <Image
                      src={`/catalogue/men/studio/functional/${String(number).padStart(2, "0")}.png`}
                      alt={`${name} men's embroidered jutti`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="catalogue-photo-image"
                    />
                  </div>
                </div>
                <figcaption className="flex min-h-14 items-center justify-between gap-2 border-t border-[var(--theme-color-border)] px-3 py-2">
                  <span className="font-serif text-sm font-bold leading-tight text-[var(--theme-color-text)]">{name}</span>
                  <span className="shrink-0 text-xs font-semibold text-[var(--theme-color-jewel)] underline-offset-2 group-hover:underline">Source photo</span>
                </figcaption>
              </a>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
