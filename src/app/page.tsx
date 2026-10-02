// Hermes autonomy verification: 2026-09-08 00:47:14
// Hermes autonomy verification: 2026-09-02 20:44:46
// Hermes autonomy verification: 2026-08-31 23:04:11
// Hermes autonomy verification: 2026-08-31 23:01:34
// Hermes autonomy verification: 2026-08-31 16:23:46
import { prisma } from "@/lib/prisma";
import { getSiteSettingsMap } from "@/app/actions/settings";
import { getPublishedStorefrontConfig } from "@/lib/storefrontConfig";
import { getActiveFestival } from "@/app/actions/festivals";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { Hero } from "@/components/home/Hero";
import { CraftsmanshipScrollStory } from "@/components/home/CraftsmanshipScrollStory";
import { HeritageArtistrySection } from "@/components/home/HeritageArtistrySection";
import { VirtualShowroom } from "@/components/home/VirtualShowroom";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { InteractiveSizeFinderSection } from "@/components/home/InteractiveSizeFinderSection";
import { Features } from "@/components/home/Features";
import { FestivalOverlay } from "@/components/home/FestivalOverlay";

export default async function Home() {
  const [siteSettings, activeFestival, featuredProducts, publishedSections] = await Promise.all([
    getSiteSettingsMap(),
    getActiveFestival(),
    prisma.product.findMany({
      where: { archived: false, published: true },
      include: { images: true },
      take: 8
    }).catch(() => []),
    getPublishedStorefrontConfig("homepage")
  ]);

  const heroImage = siteSettings["branding.heroImage"];
  const artisanImage1 = siteSettings["branding.artisanImage1"];
  const artisanImage2 = siteSettings["branding.artisanImage2"];
  const collectionWedding = siteSettings["branding.collectionWedding"];
  const collectionFestive = siteSettings["branding.collectionFestive"];
  const collectionCasual = siteSettings["branding.collectionCasual"];

  // Find published section dynamic overrides
  const heroSection = publishedSections.find((s) => s.type === "HERO_BANNER");
  const activeHeroImage = heroSection?.image || heroImage;

  return (
    <StorefrontLayout activeFestivalTheme={activeFestival?.theme || "default"}>
      <FestivalOverlay activeFestival={activeFestival} />
      <Hero />
      <CraftsmanshipScrollStory />
      <HeritageArtistrySection 
        artisanImage1={artisanImage1} 
        artisanImage2={artisanImage2} 
      />
      <VirtualShowroom products={featuredProducts} />
      <FeaturedCollections 
        collectionWedding={collectionWedding}
        collectionFestive={collectionFestive}
        collectionCasual={collectionCasual}
      />
      <TrendingProducts />
      <InteractiveSizeFinderSection />
      <Features />
    </StorefrontLayout>
  );
}
