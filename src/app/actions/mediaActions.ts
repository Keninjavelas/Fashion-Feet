"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { calculateUsedInLocations } from "@/lib/media";

export async function createMediaAssetAction(data: {
  name: string;
  filename: string;
  url: string;
  altText?: string;
  type?: string;
  folder: string;
  fileSize?: string;
  dimensions?: string;
  status?: string;
}) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const usedInList = await calculateUsedInLocations(data.url, data.folder);

    const asset = await prisma.mediaAsset.create({
      data: {
        name: data.name || data.filename,
        filename: data.filename,
        url: data.url,
        altText: data.altText || data.name,
        type: data.type || "IMAGE",
        folder: data.folder || "branding",
        fileSize: data.fileSize || "120 KB",
        dimensions: data.dimensions || "1024 x 1024",
        status: data.status || "DRAFT", // New uploads start as DRAFT until published
        usedIn: JSON.stringify(usedInList)
      }
    });

    revalidatePath("/admin/media");
    revalidatePath("/");
    return { success: true, asset };
  } catch (err: any) {
    console.error("createMediaAssetAction error:", err);
    return { error: "Failed to upload media asset." };
  }
}

export async function updateMediaAssetAction(
  id: string,
  data: {
    name?: string;
    altText?: string;
    folder?: string;
    status?: string;
    isFavorite?: boolean;
  }
) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) return { error: "Asset not found." };

    const usedInList = await calculateUsedInLocations(existing.url, data.folder || existing.folder);

    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        ...data,
        usedIn: JSON.stringify(usedInList)
      }
    });

    revalidatePath("/admin/media");
    revalidatePath("/");
    return { success: true, asset: updated };
  } catch (err: any) {
    console.error("updateMediaAssetAction error:", err);
    return { error: "Failed to update media asset." };
  }
}

export async function publishMediaAssetAction(id: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: { status: "PUBLISHED" }
    });

    revalidatePath("/admin/media");
    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true, asset: updated };
  } catch (err: any) {
    console.error("publishMediaAssetAction error:", err);
    return { error: "Failed to publish media asset." };
  }
}

export async function replaceMediaAssetAction(id: string, newUrl: string, newDimensions?: string, newSize?: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) return { error: "Asset not found." };

    const usedInList = await calculateUsedInLocations(newUrl, existing.folder);

    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        url: newUrl,
        dimensions: newDimensions || existing.dimensions,
        fileSize: newSize || existing.fileSize,
        status: "DRAFT", // Replaced assets enter DRAFT mode for preview
        usedIn: JSON.stringify(usedInList)
      }
    });

    revalidatePath("/admin/media");
    return { success: true, asset: updated };
  } catch (err: any) {
    console.error("replaceMediaAssetAction error:", err);
    return { error: "Failed to replace asset." };
  }
}

export async function deleteMediaAssetAction(id: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) return { error: "Asset not found." };

    if (existing.status === "TRASH") {
      await prisma.mediaAsset.delete({ where: { id } });
    } else {
      await prisma.mediaAsset.update({
        where: { id },
        data: { status: "TRASH" }
      });
    }

    revalidatePath("/admin/media");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("deleteMediaAssetAction error:", err);
    return { error: "Failed to delete media asset." };
  }
}

export async function toggleMediaFavoriteAction(id: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) return { error: "Asset not found." };

    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: { isFavorite: !existing.isFavorite }
    });

    revalidatePath("/admin/media");
    return { success: true, isFavorite: updated.isFavorite };
  } catch (err: any) {
    console.error("toggleMediaFavoriteAction error:", err);
    return { error: "Failed to toggle favorite." };
  }
}
