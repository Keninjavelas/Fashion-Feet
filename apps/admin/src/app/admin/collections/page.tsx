import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionManagerClient } from "@/components/admin/CollectionManagerClient";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Collections Management | Fashion Feet Admin",
};

export default async function AdminCollectionsPage() {
  if (!(await getAuthenticatedAdmin())) redirect("/admin/login");

  const [collections, allProducts] = await Promise.all([
    prisma.collection.findMany({
      include: { products: { select: { id: true, title: true, sku: true, price: true } } },
      orderBy: { displayOrder: "asc" }
    }).catch(() => []),
    prisma.product.findMany({
      select: { id: true, title: true, sku: true, collectionId: true }
    }).catch(() => [])
  ]);

  return (
    <AdminShell>
      <CollectionManagerClient
        initialCollections={collections as any}
        allProducts={allProducts as any}
      />
    </AdminShell>
  );
}
