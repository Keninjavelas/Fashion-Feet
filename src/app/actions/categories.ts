"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const name = (formData.get("name") as string || "").trim();
    const description = (formData.get("description") as string || "").trim() || null;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (!name) return { error: "Category Name is required." };

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) return { error: "A category with this name already exists." };

    const category = await prisma.category.create({
      data: { name, slug, description }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "CATEGORY_CREATED",
      resourceType: "Category",
      resourceId: category.id,
      metadata: { name: category.name }
    });

    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error) {
    return { error: "Failed to create category." };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const target = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!target) return { error: "Category not found." };

    // Prevent deletion if products use this category
    const count = await prisma.product.count({ where: { category: target.name } });
    if (count > 0) {
      return { error: `Cannot delete category "${target.name}". It is currently assigned to ${count} product(s). Reassign them first.` };
    }

    await prisma.category.delete({ where: { id: categoryId } });

    await logAdminAudit({
      adminId: admin.id,
      action: "CATEGORY_DELETED",
      resourceType: "Category",
      resourceId: categoryId,
      metadata: { name: target.name }
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete category." };
  }
}

export async function createOccasionAction(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const name = (formData.get("name") as string || "").trim();
    const description = (formData.get("description") as string || "").trim() || null;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (!name) return { error: "Occasion Name is required." };

    const existing = await prisma.occasion.findUnique({ where: { name } });
    if (existing) return { error: "An occasion with this name already exists." };

    const occasion = await prisma.occasion.create({
      data: { name, slug, description }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "OCCASION_CREATED",
      resourceType: "Occasion",
      resourceId: occasion.id,
      metadata: { name: occasion.name }
    });

    revalidatePath("/admin/categories");
    return { success: true, occasion };
  } catch (error) {
    return { error: "Failed to create occasion." };
  }
}

export async function deleteOccasionAction(occasionId: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const target = await prisma.occasion.findUnique({ where: { id: occasionId } });
    if (!target) return { error: "Occasion not found." };

    // Prevent deletion if products use this occasion
    const count = await prisma.product.count({ where: { occasion: target.name } });
    if (count > 0) {
      return { error: `Cannot delete occasion "${target.name}". It is currently assigned to ${count} product(s). Reassign them first.` };
    }

    await prisma.occasion.delete({ where: { id: occasionId } });

    await logAdminAudit({
      adminId: admin.id,
      action: "OCCASION_DELETED",
      resourceType: "Occasion",
      resourceId: occasionId,
      metadata: { name: target.name }
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete occasion." };
  }
}
