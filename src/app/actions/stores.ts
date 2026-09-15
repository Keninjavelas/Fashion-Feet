"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function createStoreAction(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const name = (formData.get("name") as string || "").trim();
    const code = (formData.get("code") as string || "").trim() || null;
    const type = (formData.get("type") as string || "FLAGSHIP").trim();
    const status = (formData.get("status") as string || "OPEN").trim();
    const city = (formData.get("city") as string || "").trim();
    const state = (formData.get("state") as string || "").trim();
    const country = (formData.get("country") as string || "India").trim();
    const street = (formData.get("street") as string || "").trim() || null;
    const pinCode = (formData.get("pinCode") as string || "").trim() || null;
    const googleMapsUrl = (formData.get("googleMapsUrl") as string || "").trim() || null;
    const phone = (formData.get("phone") as string || "").trim() || null;
    const email = (formData.get("email") as string || "").trim() || null;
    const whatsapp = (formData.get("whatsapp") as string || "").trim() || null;
    const openingHours = (formData.get("openingHours") as string || "").trim() || null;
    const services = (formData.get("services") as string || "").trim() || null;
    const photos = (formData.get("photos") as string || "").trim() || null;
    const description = (formData.get("description") as string || "").trim() || null;
    const accessibility = (formData.get("accessibility") as string || "").trim() || null;

    if (!name || !city || !state) {
      return { error: "Store Name, City, and State are required fields." };
    }

    if (code) {
      const existing = await prisma.store.findUnique({ where: { code } });
      if (existing) return { error: `Store Code "${code}" is already in use.` };
    }

    const store = await prisma.store.create({
      data: {
        name,
        code,
        type,
        status,
        city,
        state,
        country,
        street,
        pinCode,
        googleMapsUrl,
        phone,
        email,
        whatsapp,
        openingHours,
        services,
        photos,
        description,
        accessibility,
      }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "STORE_CREATED",
      resourceType: "Store",
      resourceId: store.id,
      metadata: { name: store.name, status: store.status }
    });

    revalidatePath("/admin/stores");
    revalidatePath("/stores");
    return { success: true, store };
  } catch (error) {
    console.error("Error creating store:", error);
    return { error: "Failed to create store." };
  }
}

export async function updateStoreAction(storeId: string, formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const name = (formData.get("name") as string || "").trim();
    const code = (formData.get("code") as string || "").trim() || null;
    const type = (formData.get("type") as string || "FLAGSHIP").trim();
    const status = (formData.get("status") as string || "OPEN").trim();
    const city = (formData.get("city") as string || "").trim();
    const state = (formData.get("state") as string || "").trim();
    const country = (formData.get("country") as string || "India").trim();
    const street = (formData.get("street") as string || "").trim() || null;
    const pinCode = (formData.get("pinCode") as string || "").trim() || null;
    const googleMapsUrl = (formData.get("googleMapsUrl") as string || "").trim() || null;
    const phone = (formData.get("phone") as string || "").trim() || null;
    const email = (formData.get("email") as string || "").trim() || null;
    const whatsapp = (formData.get("whatsapp") as string || "").trim() || null;
    const openingHours = (formData.get("openingHours") as string || "").trim() || null;
    const services = (formData.get("services") as string || "").trim() || null;
    const photos = (formData.get("photos") as string || "").trim() || null;
    const description = (formData.get("description") as string || "").trim() || null;
    const accessibility = (formData.get("accessibility") as string || "").trim() || null;

    if (!name || !city || !state) {
      return { error: "Store Name, City, and State are required fields." };
    }

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        name,
        code,
        type,
        status,
        city,
        state,
        country,
        street,
        pinCode,
        googleMapsUrl,
        phone,
        email,
        whatsapp,
        openingHours,
        services,
        photos,
        description,
        accessibility,
      }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "STORE_UPDATED",
      resourceType: "Store",
      resourceId: updated.id,
      metadata: { name: updated.name, status: updated.status }
    });

    revalidatePath("/admin/stores");
    revalidatePath("/stores");
    return { success: true, store: updated };
  } catch (error) {
    console.error("Error updating store:", error);
    return { error: "Failed to update store." };
  }
}

export async function deleteStoreAction(storeId: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin || admin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Super Admin role required to delete physical store records." };
  }

  try {
    await prisma.store.delete({ where: { id: storeId } });

    await logAdminAudit({
      adminId: admin.id,
      action: "STORE_DELETED",
      resourceType: "Store",
      resourceId: storeId
    });

    revalidatePath("/admin/stores");
    revalidatePath("/stores");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete store." };
  }
}
