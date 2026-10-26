import { CollectionPage } from "@/components/shop/CollectionPage";
import { prisma } from "@/lib/prisma";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default async function FestiveCollection() {
  const products = await prisma.product.findMany({
    where: { category: "Festive", published: true, archived: false, hidden: false },
    include: { images: { take: 1 } },
  });

  return (
    <StorefrontLayout>
      <CollectionPage 
        title="Festive Collection" 
        description="Celebrate the season in style. Our festive collection brings together the brightest colors and most intricate designs to light up your celebrations."
        products={products}
      />
    </StorefrontLayout>
  );
}
