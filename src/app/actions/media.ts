"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";
import { calculateUsedInLocations } from "@/lib/media";
import { revalidatePath } from "next/cache";

export async function createMediaAsset(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  const name = (formData.get("name") as string || "Untitled Asset").trim();
  const url = (formData.get("url") as string || "").trim();
  const folder = (formData.get("folder") as string || "branding").trim();
  const altText = (formData.get("altText") as string || "").trim();
  const type = (formData.get("type") as string || "IMAGE").trim();

  if (!url) return { error: "Asset URL is required." };

  const filename = url.split("/").pop() || "asset.jpg";
  const usedInList = await calculateUsedInLocations(url, folder);

  const asset = await prisma.mediaAsset.create({
    data: {
      name,
      filename,
      url,
      folder,
      altText: altText || null,
      type,
      status: "PUBLISHED",
      usedIn: JSON.stringify(usedInList),
    }
  });

  await logAdminAudit({
    adminId: admin.id,
    action: "MEDIA_UPLOAD",
    resourceType: "MediaAsset",
    resourceId: asset.id,
    metadata: { name, folder, url }
  });

  revalidatePath("/admin/media");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true, asset };
}

export async function updateMediaAsset(assetId: string, formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  const name = (formData.get("name") as string || "").trim();
  const altText = (formData.get("altText") as string || "").trim();
  const folder = (formData.get("folder") as string || "").trim();
  const status = (formData.get("status") as string || "PUBLISHED").trim();
  const newUrl = (formData.get("url") as string || "").trim();

  const existing = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
  if (!existing) return { error: "Media asset not found." };

  const url = newUrl || existing.url;
  const usedInList = await calculateUsedInLocations(url, folder || existing.folder);

  const updated = await prisma.mediaAsset.update({
    where: { id: assetId },
    data: {
      ...(name && { name }),
      ...(altText !== undefined && { altText: altText || null }),
      ...(folder && { folder }),
      ...(status && { status }),
      ...(newUrl && { url: newUrl, filename: newUrl.split("/").pop() || existing.filename }),
      usedIn: JSON.stringify(usedInList)
    }
  });

  await logAdminAudit({
    adminId: admin.id,
    action: "MEDIA_UPDATE",
    resourceType: "MediaAsset",
    resourceId: assetId,
    metadata: { name, folder, status }
  });

  revalidatePath("/admin/media");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true, updated };
}

export async function deleteMediaAsset(assetId: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  const existing = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
  if (!existing) return { error: "Asset not found." };

  await prisma.mediaAsset.delete({ where: { id: assetId } });

  await logAdminAudit({
    adminId: admin.id,
    action: "MEDIA_DELETE",
    resourceType: "MediaAsset",
    resourceId: assetId,
    metadata: { name: existing.name, url: existing.url }
  });

  revalidatePath("/admin/media");
  return { success: true };
}
