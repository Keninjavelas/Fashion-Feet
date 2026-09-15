import { CollectionPage } from "@/components/shop/CollectionPage";
import { prisma } from "@/lib/prisma";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default async function MenCollection() {
  const products = await prisma.product.findMany({
    where: { 
      OR: [
        { gender: { equals: "Men" } },
        { gender: { equals: "Unisex" } },
        { category: { equals: "Men" } }
      ]
    },
    include: { images: { take: 1 } },
  }).catch(() => []);

  return (
    <StorefrontLayout>
      <CollectionPage 
        title="Men's Collection" 
        description="Discover our premium range of handcrafted Punjabi Juttis for men. Perfect for weddings, festive occasions, and everyday elegance."
        products={products}
      />
    </StorefrontLayout>
  );
}
