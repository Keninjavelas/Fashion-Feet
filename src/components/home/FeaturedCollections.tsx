import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { StorefrontSection } from "@/lib/storefrontConfigTypes";
import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";

type CollectionCard = {
  title: string;
  description: string;
  href: string;
  image?: string;
  isLocalPreview?: boolean;
};

export function FeaturedCollections({
  collectionWedding,
  collectionFestive,
  collectionCasual,
  section,
  publishedCollections = [],
  hasCollectionRecords = false,
}: {
  collectionWedding?: string;
  collectionFestive?: string;
  collectionCasual?: string;
  section?: StorefrontSection;
  publishedCollections?: { id: string; title: string; description: string | null; banner: string | null; thumbnail: string | null }[];
  hasCollectionRecords?: boolean;
}) {
  const curatedImage = (value: string | undefined, fallback: string) =>
    value && value !== PLACEHOLDER_HOMEPAGE_IMAGE ? value : fallback;
  const previewCards: CollectionCard[] = [
    {
      title: "Daily Wear",
      description: "Easygoing shapes and rich colour for everyday dressing.",
      href: "/shop?catalogue=daily-wear&gender=Women",
      image: curatedImage(collectionCasual, "/catalogue/women/studio/daily-wear/01.png"),
      isLocalPreview: !collectionCasual || collectionCasual === PLACEHOLDER_HOMEPAGE_IMAGE,
    },
    {
      title: "Festive",
      description: "Expressive designs made to stand out at a celebration.",
      href: "/shop?catalogue=festive&gender=Women",
      image: curatedImage(collectionFestive, "/catalogue/women/studio/festive-v2/02.png"),
      isLocalPreview: !collectionFestive || collectionFestive === PLACEHOLDER_HOMEPAGE_IMAGE,
    },
    {
      title: "Ceremonial",
      description: "Statement pairs with details worth a closer look.",
      href: "/shop?catalogue=ceremonial&gender=Women",
      image: curatedImage(collectionWedding, "/catalogue/women/studio/ceremonial-v2/02.png"),
      isLocalPreview: !collectionWedding || collectionWedding === PLACEHOLDER_HOMEPAGE_IMAGE,
    },
  ];
  const cards: CollectionCard[] = hasCollectionRecords
    ? publishedCollections.slice(0, 6).map((collection) => ({
        title: collection.title,
        description: collection.description || "Explore this collection.",
        href: `/shop?collection=${encodeURIComponent(collection.id)}`,
        image: collection.thumbnail || collection.banner || undefined,
      }))
    : previewCards;

  return (
    <section className="bg-[var(--theme-color-bg)] py-20 text-[var(--theme-color-text)] md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:mb-14 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--theme-color-accent)]">{section?.badge || "The collections"}</p>
            <h2 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">{section?.title || "Find your next pair"}</h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-[var(--theme-color-text-muted)]">{section?.subtitle || "Explore Fashion Feet designs for everyday wear, festive moments, and ceremonies."}</p>
        </div>

        {cards.length === 0 ? (
          <p className="border-t border-[var(--theme-color-border)] py-10 text-[var(--theme-color-text-muted)]">New collections are coming soon.</p>
        ) : (
          <div className="grid gap-7 md:grid-cols-3">
            {cards.map((card) => (
              <Link key={card.href} href={card.href} className="group block border-t border-[var(--theme-color-border)] pt-4 focus-visible:outline-offset-4">
                <div className="relative aspect-[4/4.3] overflow-hidden bg-[#e9dfd3]">
                  {card.image && card.image !== PLACEHOLDER_HOMEPAGE_IMAGE ? (
                    card.isLocalPreview ? (
                      <Image src={card.image} alt={`${card.title} Punjabi jutti design`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]" />
                    ) : (
                      // Admin-managed collection media may be hosted outside the Next image allowlist.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.image} alt={`${card.title} collection`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center px-8 text-center font-serif text-3xl text-[#6b4d43]">{card.title}</div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-4 pt-5">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--theme-color-text-muted)]">{card.description}</p>
                  </div>
                  <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[var(--theme-color-jewel)] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        )}
        {!hasCollectionRecords && <p className="mt-8 text-xs text-[var(--theme-color-text-muted)]">Explore photographed designs in both the women&apos;s and men&apos;s catalogues.</p>}
      </div>
    </section>
  );
}
