import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { getDraftStorefrontConfig } from "@/lib/storefrontConfig";
import { StorefrontVisualEditorClient } from "@/components/admin/StorefrontVisualEditorClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Storefront Visual Editor | Fashion Feet Admin",
};

export default async function AdminEditorPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect("/admin/login");

  const [draftConfig, mediaAssets] = await Promise.all([
    getDraftStorefrontConfig("homepage"),
    prisma.mediaAsset.findMany({
      select: { id: true, name: true, url: true, folder: true },
      orderBy: { createdAt: "desc" }
    }).catch(() => [])
  ]);

  return (
    <StorefrontVisualEditorClient
      initialPage="homepage"
      initialSections={draftConfig.sections}
      mediaAssets={mediaAssets}
      adminRole={admin.role}
    />
  );
}
