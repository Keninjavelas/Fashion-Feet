import { CollectionPage } from "@/components/shop/CollectionPage";
import { prisma } from "@/lib/prisma";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { getPublishedStorefrontConfig } from "@/lib/storefrontConfig";
import { MenCatalogueGallery } from "@/components/shop/MenCatalogueGallery";

export const dynamic = "force-dynamic";

export default async function MenCollection() {
  const [products, sections] = await Promise.all([prisma.product.findMany({
    where: { 
      archived: false,
      published: true,
      hidden: false,
      gender: { in: ["Men", "Unisex"] }
    },
    include: { images: { take: 1 } },
  }).catch(() => []), getPublishedStorefrontConfig("men")]);
  const hero = sections.find((section) => section.type === "HERO_BANNER");

  return (
    <StorefrontLayout>
      <CollectionPage 
        title="Men's Collection" 
        description="Explore Daily Wear, Festive, Ceremonial, and Functional footwear for men."
        products={products}
        gender="Men"
        emptyContent={<MenCatalogueGallery />}
        section={hero}
        hideHero={hero?.visible === false}
      />
    </StorefrontLayout>
  );
}
