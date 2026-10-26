import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { CategoryOccasionClient } from "@/components/admin/CategoryOccasionClient";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { CATALOGUES } from "@/lib/catalogues";

export const metadata = {
  title: "Product Types & Catalogues | Fashion Feet Admin",
};

export default async function AdminCategoriesPage() {
  if (!(await getAuthenticatedAdmin())) redirect("/admin/login");

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { displayOrder: "asc" } }).catch(() => []),
    prisma.product.findMany({ select: { category: true, occasion: true } }).catch(() => [])
  ]);

  const categoryCounts: Record<string, number> = {};
  const occasionCounts: Record<string, number> = {};

  products.forEach((p) => {
    if (p.category) categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    if (p.occasion) occasionCounts[p.occasion] = (occasionCounts[p.occasion] || 0) + 1;
  });

  const categoryItems = categories.map((c) => ({
    ...c,
    productCount: categoryCounts[c.name] || 0
  }));

  const occasionItems = CATALOGUES.map((catalogue) => ({
    id: catalogue.slug,
    name: catalogue.name,
    slug: catalogue.slug,
    description: null,
    productCount: occasionCounts[catalogue.name] || 0
  }));

  return (
    <AdminShell>
      <CategoryOccasionClient
        categories={categoryItems}
        occasions={occasionItems}
      />
    </AdminShell>
  );
}
