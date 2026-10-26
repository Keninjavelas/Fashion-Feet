import { CollectionPage } from "@/components/shop/CollectionPage";
import { prisma } from "@/lib/prisma";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { getPublishedStorefrontConfig } from "@/lib/storefrontConfig";

export const dynamic = "force-dynamic";

export default async function MenCollection() {
  const [products, sections] = await Promise.all([prisma.product.findMany({
    where: { 
      archived: false,
      published: true,
      hidden: false,
      OR: [
        { gender: { equals: "Men" } },
        { gender: { equals: "Unisex" } },
        { category: { equals: "Men" } }
      ]
    },
    include: { images: { take: 1 } },
  }).catch(() => []), getPublishedStorefrontConfig("men")]);
  const hero = sections.find((section) => section.type === "HERO_BANNER");

  return (
    <StorefrontLayout>
      <CollectionPage 
        title="Men's Collection" 
        description="Discover our premium range of handcrafted Punjabi Juttis for men. Perfect for weddings, festive occasions, and everyday elegance."
        products={products}
        section={hero}
        hideHero={hero?.visible === false}
      />
    </StorefrontLayout>
  );
}
