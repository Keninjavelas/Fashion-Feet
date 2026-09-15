"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

export async function createDiscount(formData: FormData) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const title = formData.get("title") as string;
    const percentage = parseFloat(formData.get("percentage") as string) || null;
    const flatAmount = parseFloat(formData.get("flatAmount") as string) || null;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const promotionalBanner = formData.get("promotionalBanner") as string || null;
    const featuredOnHomepage = formData.get("featuredOnHomepage") === "true";
    const productId = formData.get("productId") as string || null;

    if (!title || !startDateStr || !endDateStr) {
      return { error: "Title, Start Date, and End Date are required." };
    }

    const discount = await prisma.discount.create({
      data: {
        title,
        percentage,
        flatAmount,
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
        promotionalBanner,
        featuredOnHomepage,
        productId: productId || undefined
      }
    });

    revalidatePath("/admin/discounts");
    revalidatePath("/shop");
    return { success: true, discount };
  } catch (error) {
    console.error("Error creating discount:", error);
    return { error: "Failed to create promotion." };
  }
}

export async function deleteDiscount(id: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    await prisma.discount.delete({ where: { id } });
    revalidatePath("/admin/discounts");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete discount." };
  }
}
