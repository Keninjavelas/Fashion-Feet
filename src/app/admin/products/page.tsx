import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductCatalogClient } from "@/components/admin/ProductCatalogClient";

export const metadata = {
  title: "Product Management | Fashion Feet Admin",
};

export default async function AdminProductsPage() {
  const [products, collections, categories, occasions, mediaAssets] = await Promise.all([
    prisma.product.findMany({
      include: { collection: true, images: true },
      orderBy: { createdAt: "desc" }
    }).catch(() => []),
    prisma.collection.findMany({ select: { id: true, title: true } }).catch(() => []),
    prisma.category.findMany({ select: { id: true, name: true } }).catch(() => []),
    prisma.occasion.findMany({ select: { id: true, name: true } }).catch(() => []),
    prisma.mediaAsset.findMany({
      select: { id: true, name: true, url: true, folder: true },
      orderBy: { createdAt: "desc" }
    }).catch(() => [])
  ]);

  return (
    <AdminShell>
      <ProductCatalogClient
        initialProducts={products as any}
        collections={collections}
        categories={categories}
        occasions={occasions}
        mediaAssets={mediaAssets}
      />
    </AdminShell>
  );
}
