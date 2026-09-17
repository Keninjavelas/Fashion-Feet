import { prisma } from "@/lib/prisma";
import { TrendingProductsClient } from "./TrendingProductsClient";

export async function TrendingProducts() {
  const products = await prisma.product.findMany({
    // Same public visibility predicate as the storefront homepage query and the
    // public /api/v1/products listing, so archived or unpublished rows can
    // never surface in the gallery.
    where: { archived: false, published: true, featured: true },
    include: { images: { take: 1 } },
    take: 8
  });

  return <TrendingProductsClient products={products} />;
}
