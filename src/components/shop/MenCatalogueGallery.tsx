import Image from "next/image";
import Link from "next/link";
import { cataloguesForGender } from "@/lib/catalogues";
import whatsappPhotos from "@/data/men-whatsapp-gallery.json";

type Design = {
  name: string;
  preview: string;
  original: string;
  presentation: "studio" | "source";
  tall?: boolean;
};

const STUDIO_DESIGNS: Partial<Record<string, Design[]>> = {
  functional: ["Midnight Vine", "Crimson Roses", "Navy Starflower", "Emerald Leaves", "Midnight Pearls"].map((name, index) => ({
    name,
    preview: `/catalogue/men/studio/functional/${String(index + 1).padStart(2, "0")}.png`,
    original: "/catalogue/men/functional/group.jpeg",
    presentation: "studio" as const,
  })),
  "office-wear": ["Midnight Weave", "Chestnut Braid", "Tan Floral Emboss"].map((name, index) => ({
    name,
    preview: `/catalogue/men/studio/office-wear/${String(index + 1).padStart(2, "0")}.png`,
    original: `/catalogue/men/office-wear/${String(index + 1).padStart(2, "0")}.jpeg`,
    presentation: "studio" as const,
  })),
};

const WHATSAPP_DESIGNS = whatsappPhotos.map((photo, index) => {
  const source = `/catalogue/men/whatsapp-2026-11-07/${String(index + 1).padStart(2, "0")}.jpeg`;
  return { category: photo.category, name: photo.name, preview: source, original: source, presentation: "source" as const, tall: index >= 43 };
});

const GROUPS = cataloguesForGender("Men").map((catalogue) => ({
  ...catalogue,
  designs: [
    ...(STUDIO_DESIGNS[catalogue.slug] ?? []),
    ...WHATSAPP_DESIGNS.filter((photo) => photo.category === catalogue.slug),
  ],
}));

export function MenCatalogueGallery({ selectedCatalogue }: { selectedCatalogue?: string }) {
  const groups = GROUPS.filter((group) => group.designs.length > 0 && (!selectedCatalogue || group.slug === selectedCatalogue));

  return (
    <div className="space-y-12" aria-label="Men's footwear photo previews">
      <div className="rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] p-5 text-[var(--theme-color-text)]">
        <h2 className="font-serif text-2xl font-bold">Explore the designs</h2>
        <p className="mt-2 text-sm text-[var(--theme-color-text-muted)]">
          These photographed designs have descriptive names inspired by their appearance. Some previews are studio cutouts; the newly supplied photographs are shown in uniform frames. Open each source photo to inspect exact details. Ask us to confirm prices, sizes, and availability.
        </p>
        <Link href="/contact" className="mt-4 inline-flex rounded-full bg-[var(--theme-color-jewel)] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90">Ask about a pictured jutti</Link>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] p-6 text-center text-[var(--theme-color-text-muted)]">
          Photographs for this men's catalogue are being prepared. Contact us to ask about current designs.
        </p>
      ) : groups.map((group) => <section key={group.slug} aria-labelledby={`gallery-${group.slug}`} className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h3 id={`gallery-${group.slug}`} className="font-serif text-2xl font-bold text-inherit">{group.name}</h3>
          <span className="text-xs opacity-70">{group.designs.length} designs</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {group.designs.map((design) => (
            <figure key={design.preview} className="overflow-hidden rounded-2xl border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] shadow-sm">
              <a href={design.original} target="_blank" rel="noopener noreferrer" aria-label={`View the original photograph of ${design.name}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--theme-color-accent)]">
                <div className="catalogue-photo-stage" style={{ aspectRatio: "3 / 4" }}>
                  <div className={`absolute z-10 transition-transform duration-300 group-hover:scale-[1.03] ${design.presentation === "studio" ? "inset-[8%]" : "inset-0"}`}>
                    <Image src={design.preview} alt={`${design.name} men's footwear`} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className={design.presentation === "studio" ? "catalogue-photo-image" : design.tall ? "object-contain" : "object-cover"} />
                  </div>
                </div>
                <figcaption className="flex min-h-14 items-center justify-between gap-2 border-t border-[var(--theme-color-border)] px-3 py-2">
                  <span className="font-serif text-sm font-bold leading-tight text-[var(--theme-color-text)]">{design.name}</span>
                  <span className="shrink-0 text-xs font-semibold text-[var(--theme-color-jewel)] underline-offset-2 group-hover:underline">Source photo</span>
                </figcaption>
              </a>
            </figure>
          ))}
        </div>
      </section>)}
    </div>
  );
}
