import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { CategoryOccasionClient } from "@/components/admin/CategoryOccasionClient";

export const metadata = {
  title: "Categories & Occasions | Fashion Feet Admin",
};

export default async function AdminCategoriesPage() {
  const [categories, occasions, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { displayOrder: "asc" } }).catch(() => []),
    prisma.occasion.findMany({ orderBy: { displayOrder: "asc" } }).catch(() => []),
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

  const occasionItems = occasions.map((o) => ({
    ...o,
    productCount: occasionCounts[o.name] || 0
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
