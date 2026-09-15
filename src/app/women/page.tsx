import { CollectionPage } from "@/components/shop/CollectionPage";
import { prisma } from "@/lib/prisma";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default async function WomenCollection() {
  const products = await prisma.product.findMany({
    where: { 
      OR: [
        { gender: { equals: "Women" } },
        { gender: { equals: "Unisex" } },
        { category: { equals: "Women" } },
        { category: { equals: "Wedding" } }
      ]
    },
    include: { images: { take: 1 } },
  }).catch(() => []);

  return (
    <StorefrontLayout>
      <CollectionPage 
        title="Women's Collection" 
        description="Step into elegance with our exquisite handcrafted Juttis for women. Featuring intricate embroidery, premium leather, and unparalleled comfort."
        products={products}
      />
    </StorefrontLayout>
  );
}
