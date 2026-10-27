import { CollectionPage } from "@/components/shop/CollectionPage";
import { prisma } from "@/lib/prisma";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { getPublishedStorefrontConfig } from "@/lib/storefrontConfig";
import { WomenCatalogueGallery } from "@/components/shop/WomenCatalogueGallery";

export const dynamic = "force-dynamic";

export default async function WomenCollection() {
  const [products, sections] = await Promise.all([prisma.product.findMany({
    where: { 
      archived: false,
      published: true,
      hidden: false,
      gender: { in: ["Women", "Unisex"] }
    },
    include: { images: { take: 1 } },
  }).catch(() => []), getPublishedStorefrontConfig("women")]);
  const hero = sections.find((section) => section.type === "HERO_BANNER");

  return (
    <StorefrontLayout>
      <CollectionPage 
        title="Women's Collection" 
        description="Explore Daily Wear, Festive, and Ceremonial footwear for women."
        products={products}
        gender="Women"
        emptyContent={<WomenCatalogueGallery />}
        section={hero}
        hideHero={hero?.visible === false}
      />
    </StorefrontLayout>
  );
}
