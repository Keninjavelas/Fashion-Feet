import { prisma } from "@/lib/prisma";
import { MediaLibraryClient } from "@/components/admin/MediaLibraryClient";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Media Library | Fashion Feet Admin",
};

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { updatedAt: "desc" }
  }).catch(() => []);

  return (
    <AdminShell>
      <MediaLibraryClient initialAssets={assets} />
    </AdminShell>
  );
}
