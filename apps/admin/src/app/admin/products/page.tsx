import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductCatalogClient } from "@/components/admin/ProductCatalogClient";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Product Management | Fashion Feet Admin",
};

export default async function AdminProductsPage() {
  if (!(await getAuthenticatedAdmin())) redirect("/admin/login");

  const [products, collections, categories, mediaAssets] = await Promise.all([
    prisma.product.findMany({
      include: { collection: true, images: true },
      orderBy: { createdAt: "desc" }
    }).catch(() => []),
    prisma.collection.findMany({ select: { id: true, title: true } }).catch(() => []),
    prisma.category.findMany({ select: { id: true, name: true } }).catch(() => []),
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
        mediaAssets={mediaAssets}
      />
    </AdminShell>
  );
}
