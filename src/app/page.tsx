// Hermes autonomy verification: 2026-09-08 00:47:14
// Hermes autonomy verification: 2026-09-02 20:44:46
// Hermes autonomy verification: 2026-08-31 23:04:11
// Hermes autonomy verification: 2026-08-31 23:01:34
// Hermes autonomy verification: 2026-08-31 16:23:46
import { prisma } from "@/lib/prisma";
import { getSiteSettingsMap } from "@/lib/siteSettings";
import { getPublishedStorefrontConfig } from "@/lib/storefrontConfig";
import { getActiveFestival } from "@/lib/activeFestival";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { Hero } from "@/components/home/Hero";
import { CraftsmanshipScrollStory } from "@/components/home/CraftsmanshipScrollStory";
import { HeritageArtistrySection } from "@/components/home/HeritageArtistrySection";
import { PastExhibitions } from "@/components/home/PastExhibitions";
import { VirtualShowroom } from "@/components/home/VirtualShowroom";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { InteractiveSizeFinderSection } from "@/components/home/InteractiveSizeFinderSection";
import { Features } from "@/components/home/Features";
import { FestivalOverlay } from "@/components/home/FestivalOverlay";
import Link from "next/link";
import type { StorefrontSection } from "@/lib/storefrontConfigTypes";

export const dynamic = "force-dynamic";

function PublishedHomepageSection({
  section,
  images,
  collections,
  hasCollectionRecords
}: {
  section: StorefrontSection;
  images: { heroImage?: string; artisanImage1?: string; artisanImage2?: string; collectionWedding?: string; collectionFestive?: string; collectionCasual?: string };
  collections: { id: string; title: string; description: string | null; banner: string | null; thumbnail: string | null }[];
  hasCollectionRecords: boolean;
}) {
  let content: React.ReactNode;
  switch (section.type) {
    case "HERO_BANNER":
      content = <Hero section={section} fallbackImage={images.heroImage} />;
      break;
    case "FEATURED_COLLECTIONS":
      content = <FeaturedCollections section={section} publishedCollections={collections} hasCollectionRecords={hasCollectionRecords} collectionWedding={images.collectionWedding} collectionFestive={images.collectionFestive} collectionCasual={images.collectionCasual} />;
      break;
    case "CRAFTSMANSHIP_HERITAGE":
      content = <HeritageArtistrySection section={section} artisanImage1={images.artisanImage1} artisanImage2={images.artisanImage2} />;
      break;
    case "TRENDING_DESIGNS":
      content = <TrendingProducts section={section} />;
      break;
    case "SIZE_STUDIO_PROMO":
      content = <InteractiveSizeFinderSection section={section} />;
      break;
    case "STORES_PROMO":
      content = (
        <section className="bg-[var(--theme-color-surface)] px-4 py-16 text-center text-[var(--theme-color-text)]">
          <div className="mx-auto max-w-3xl space-y-4">
            {section.badge && <p className="text-xs font-bold uppercase tracking-widest text-[var(--theme-color-accent)]">{section.badge}</p>}
            <h2 className="font-serif text-3xl font-bold md:text-5xl">{section.title}</h2>
            {section.subtitle && <p className="text-[var(--theme-color-text-muted)]">{section.subtitle}</p>}
            {section.description && <p className="text-sm text-[var(--theme-color-text-muted)]">{section.description}</p>}
            <Link href={section.ctaLink || "/stores"} className="inline-flex rounded-xl bg-[#8A1538] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white">
              {section.ctaText || "Explore Stores"}
            </Link>
          </div>
        </section>
      );
      break;
    default:
      return null;
  }

  return (
    <div data-published-section={section.type} data-style-preset={section.stylePreset || "DARK_ROYAL"} data-motion-preset={section.motionPreset || "NONE"}>
      {content}
    </div>
  );
}

export default async function Home() {
  const [siteSettings, activeFestival, featuredProducts, publishedSections, publishedCollections, collectionCount] = await Promise.all([
    getSiteSettingsMap(),
    getActiveFestival(),
    prisma.product.findMany({
      where: { archived: false, published: true, hidden: false },
      include: { images: true },
      take: 8
    }).catch(() => []),
    getPublishedStorefrontConfig("homepage"),
    prisma.collection.findMany({
      where: { status: "PUBLISHED", visible: true },
      select: { id: true, title: true, description: true, banner: true, thumbnail: true },
      orderBy: [{ displayOrder: "asc" }, { title: "asc" }]
    }).catch(() => []),
    prisma.collection.count({ where: { status: { not: "DRAFT" } } }).catch(() => 0)
  ]);

  const heroImage = siteSettings["branding.heroImage"];
  const artisanImage1 = siteSettings["branding.artisanImage1"];
  const artisanImage2 = siteSettings["branding.artisanImage2"];
  const collectionWedding = siteSettings["branding.collectionWedding"];
  const collectionFestive = siteSettings["branding.collectionFestive"];
  const collectionCasual = siteSettings["branding.collectionCasual"];

  const visibleSections = [...publishedSections].filter((section) => section.visible !== false).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <StorefrontLayout activeFestivalTheme={activeFestival?.theme || "default"}>
      <FestivalOverlay activeFestival={activeFestival} />
      {visibleSections.map((section) => (
        <PublishedHomepageSection
          key={section.id}
          section={section}
          images={{ heroImage, artisanImage1, artisanImage2, collectionWedding, collectionFestive, collectionCasual }}
          collections={publishedCollections}
          hasCollectionRecords={collectionCount > 0}
        />
      ))}
      <CraftsmanshipScrollStory />
      <PastExhibitions />
      <VirtualShowroom products={featuredProducts} />
      <Features />
    </StorefrontLayout>
  );
}
