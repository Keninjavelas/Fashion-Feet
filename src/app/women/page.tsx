import { CollectionPage } from "@/components/shop/CollectionPage";
import { prisma } from "@/lib/prisma";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { getPublishedStorefrontConfig } from "@/lib/storefrontConfig";

export const dynamic = "force-dynamic";

export default async function WomenCollection() {
  const [products, sections] = await Promise.all([prisma.product.findMany({
    where: { 
      archived: false,
      published: true,
      hidden: false,
      OR: [
        { gender: { equals: "Women" } },
        { gender: { equals: "Unisex" } },
        { category: { equals: "Women" } },
        { category: { equals: "Wedding" } }
      ]
    },
    include: { images: { take: 1 } },
  }).catch(() => []), getPublishedStorefrontConfig("women")]);
  const hero = sections.find((section) => section.type === "HERO_BANNER");

  return (
    <StorefrontLayout>
      <CollectionPage 
        title="Women's Collection" 
        description="Step into elegance with our exquisite handcrafted Juttis for women. Featuring intricate embroidery, premium leather, and unparalleled comfort."
        products={products}
        section={hero}
        hideHero={hero?.visible === false}
      />
    </StorefrontLayout>
  );
}
