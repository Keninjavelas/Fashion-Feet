import { prisma } from "@/lib/prisma";
import { TrendingProductsClient } from "./TrendingProductsClient";

export async function TrendingProducts() {
  const products = await prisma.product.findMany({
    where: { featured: true },
    include: { images: { take: 1 } },
    take: 8
  });

  return <TrendingProductsClient products={products} />;
}
