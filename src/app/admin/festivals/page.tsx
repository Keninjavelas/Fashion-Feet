import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { getFestivalStudioList } from "@/app/actions/festivals";
import { AdminShell } from "@/components/admin/AdminShell";
import { FestivalStudioClient } from "@/components/admin/FestivalStudioClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Seasonal Experiences & Festival Studio | Fashion Feet Admin",
};

export default async function AdminFestivalsPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect("/admin/login");

  const [festivals, mediaAssets, products] = await Promise.all([
    getFestivalStudioList(),
    prisma.mediaAsset.findMany({
      select: { id: true, name: true, url: true, folder: true },
      orderBy: { createdAt: "desc" }
    }).catch(() => []),
    prisma.product.findMany({
      where: { archived: false },
      select: { id: true, title: true, price: true, category: true, sku: true },
      take: 50,
      orderBy: { createdAt: "desc" }
    }).catch(() => [])
  ]);

  return (
    <AdminShell>
      <FestivalStudioClient
        initialFestivals={festivals}
        mediaAssets={mediaAssets}
        products={products}
        adminRole={admin.role}
        adminName={admin.name}
      />
    </AdminShell>
  );
}
