"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function createCollectionAction(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const title = (formData.get("title") as string || "").trim();
    const description = (formData.get("description") as string || "").trim() || null;
    const banner = (formData.get("banner") as string || "").trim() || null;
    const thumbnail = (formData.get("thumbnail") as string || "").trim() || null;
    const status = (formData.get("status") as string || "PUBLISHED").trim();
    const visible = formData.get("visible") !== "false";
    const displayOrder = parseInt(formData.get("displayOrder") as string, 10) || 0;

    if (!title) return { error: "Collection Title is required." };

    const collection = await prisma.collection.create({
      data: {
        title,
        description,
        banner,
        thumbnail,
        status,
        visible,
        displayOrder,
      }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "COLLECTION_CREATED",
      resourceType: "Collection",
      resourceId: collection.id,
      metadata: { title: collection.title, status: collection.status }
    });

    revalidatePath("/admin/collections");
    revalidatePath("/");
    return { success: true, collection };
  } catch (error) {
    console.error("Error creating collection:", error);
    return { error: "Failed to create collection." };
  }
}

export async function updateCollectionAction(collectionId: string, formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const title = (formData.get("title") as string || "").trim();
    const description = (formData.get("description") as string || "").trim() || null;
    const banner = (formData.get("banner") as string || "").trim() || null;
    const thumbnail = (formData.get("thumbnail") as string || "").trim() || null;
    const status = (formData.get("status") as string || "PUBLISHED").trim();
    const visible = formData.get("visible") !== "false";
    const displayOrder = parseInt(formData.get("displayOrder") as string, 10) || 0;

    if (!title) return { error: "Collection Title is required." };

    const updated = await prisma.collection.update({
      where: { id: collectionId },
      data: {
        title,
        description,
        banner,
        thumbnail,
        status,
        visible,
        displayOrder,
      }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "COLLECTION_UPDATED",
      resourceType: "Collection",
      resourceId: updated.id,
      metadata: { title: updated.title, status: updated.status }
    });

    revalidatePath("/admin/collections");
    revalidatePath("/");
    return { success: true, collection: updated };
  } catch (error) {
    console.error("Error updating collection:", error);
    return { error: "Failed to update collection." };
  }
}

export async function assignProductsToCollectionAction(collectionId: string, productIds: string[]) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    // Unassign products currently in this collection that are not in productIds
    await prisma.product.updateMany({
      where: { collectionId, id: { notIn: productIds } },
      data: { collectionId: null }
    });

    // Assign selected products to this collection
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { collectionId }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "COLLECTION_PRODUCTS_ASSIGNED",
      resourceType: "Collection",
      resourceId: collectionId,
      metadata: { count: productIds.length }
    });

    revalidatePath("/admin/collections");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error assigning products to collection:", error);
    return { error: "Failed to assign products to collection." };
  }
}

export async function deleteCollectionAction(collectionId: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    await prisma.collection.delete({ where: { id: collectionId } });

    await logAdminAudit({
      adminId: admin.id,
      action: "COLLECTION_DELETED",
      resourceType: "Collection",
      resourceId: collectionId
    });

    revalidatePath("/admin/collections");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete collection." };
  }
}
