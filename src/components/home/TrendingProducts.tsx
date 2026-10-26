import { prisma } from "@/lib/prisma";
import { TrendingProductsClient } from "./TrendingProductsClient";
import type { StorefrontSection } from "@/lib/storefrontConfigTypes";

export async function TrendingProducts({ section }: { section?: StorefrontSection }) {
  const products = await prisma.product.findMany({
    // Same public visibility predicate as the storefront homepage query and the
    // public /api/v1/products listing, so archived or unpublished rows can
    // never surface in the gallery.
    where: { archived: false, published: true, hidden: false, featured: true },
    include: { images: { take: 1 } },
    take: 8
  });

  return <TrendingProductsClient products={products} section={section} />;
}
