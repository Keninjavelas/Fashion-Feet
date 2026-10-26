import { prisma } from "@/lib/prisma";
import { MediaManagerClient } from "@/components/admin/MediaManagerClient";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { calculateMediaUsageMap } from "@/lib/media";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Media Library | Fashion Feet Admin",
};

export default async function AdminMediaPage() {
  if (!(await getAuthenticatedAdmin())) redirect("/admin/login");

  const assets = await prisma.mediaAsset.findMany({
    orderBy: { updatedAt: "desc" }
  }).catch(() => []);
  const usage = await calculateMediaUsageMap(assets.map((asset) => asset.url));
  const assetsWithUsage = assets.map((asset) => ({
    ...asset,
    usedIn: JSON.stringify(usage[asset.url] || []),
  }));

  return (
    <AdminShell>
      <MediaManagerClient initialAssets={assetsWithUsage} />
    </AdminShell>
  );
}
