"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";
import { generateProductSku } from "@/lib/sku";
import { revalidatePath } from "next/cache";

export async function generateSkuAction(gender?: string, category?: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  const sku = await generateProductSku(gender, category);
  return { sku };
}

export async function createProductAction(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const title = (formData.get("title") as string || "").trim();
    let sku = (formData.get("sku") as string || "").trim();
    const price = parseFloat(formData.get("price") as string) || 0;
    const promoPriceRaw = formData.get("promoPrice") as string;
    const promoPrice = promoPriceRaw ? parseFloat(promoPriceRaw) : null;
    const discount = parseFloat(formData.get("discount") as string) || 0;
    const description = (formData.get("description") as string || "").trim();
    const craftsmanship = (formData.get("craftsmanship") as string || "").trim() || null;
    const category = (formData.get("category") as string || "Men").trim();
    const gender = (formData.get("gender") as string || "Men").trim();
    const material = (formData.get("material") as string || "").trim() || null;
    const colors = (formData.get("colors") as string || "").trim() || null;
    const occasion = (formData.get("occasion") as string || "").trim() || null;
    const care = (formData.get("care") as string || "").trim() || null;
    const sizeGuide = (formData.get("sizeGuide") as string || "").trim() || null;
    const sizes = (formData.get("sizes") as string || "").trim() || null;
    const collectionId = (formData.get("collectionId") as string || "").trim() || null;
    const status = (formData.get("status") as string || "DRAFT").trim();

    const featured = formData.get("featured") === "true";
    const isNewArrival = formData.get("isNewArrival") === "true";
    const isBestSeller = formData.get("isBestSeller") === "true";
    const isFestivalExclusive = formData.get("isFestivalExclusive") === "true";

    const imageListRaw = formData.get("images") as string;
    let imageUrls: string[] = [];
    if (imageListRaw) {
      try { imageUrls = JSON.parse(imageListRaw); } catch { imageUrls = [imageListRaw]; }
    }

    if (!title || !price) {
      return { error: "Product Title and Display Price are required." };
    }

    if (!sku) {
      sku = await generateProductSku(gender, category);
    } else {
      const existingSku = await prisma.product.findUnique({ where: { sku } });
      if (existingSku) return { error: `Product Code / SKU "${sku}" is already in use.` };
    }

    const product = await prisma.product.create({
      data: {
        title,
        sku,
        price,
        promoPrice,
        discount,
        description,
        craftsmanship,
        category,
        gender,
        material,
        colors,
        occasion,
        care,
        sizeGuide,
        sizes,
        collectionId: collectionId || undefined,
        featured,
        isNewArrival,
        isBestSeller,
        isFestivalExclusive,
        status,
        published: status === "PUBLISHED",
        archived: status === "ARCHIVED",
        images: {
          create: imageUrls.map((url) => ({ url }))
        }
      }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "PRODUCT_CREATED",
      resourceType: "Product",
      resourceId: product.id,
      metadata: { sku: product.sku, title: product.title, status: product.status }
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true, product };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product." };
  }
}

export async function updateProductAction(productId: string, formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const title = (formData.get("title") as string || "").trim();
    const sku = (formData.get("sku") as string || "").trim();
    const price = parseFloat(formData.get("price") as string) || 0;
    const promoPriceRaw = formData.get("promoPrice") as string;
    const promoPrice = promoPriceRaw ? parseFloat(promoPriceRaw) : null;
    const discount = parseFloat(formData.get("discount") as string) || 0;
    const description = (formData.get("description") as string || "").trim();
    const craftsmanship = (formData.get("craftsmanship") as string || "").trim() || null;
    const category = (formData.get("category") as string || "Men").trim();
    const gender = (formData.get("gender") as string || "Men").trim();
    const material = (formData.get("material") as string || "").trim() || null;
    const colors = (formData.get("colors") as string || "").trim() || null;
    const occasion = (formData.get("occasion") as string || "").trim() || null;
    const care = (formData.get("care") as string || "").trim() || null;
    const sizeGuide = (formData.get("sizeGuide") as string || "").trim() || null;
    const sizes = (formData.get("sizes") as string || "").trim() || null;
    const collectionId = (formData.get("collectionId") as string || "").trim() || null;
    const status = (formData.get("status") as string || "DRAFT").trim();

    const featured = formData.get("featured") === "true";
    const isNewArrival = formData.get("isNewArrival") === "true";
    const isBestSeller = formData.get("isBestSeller") === "true";
    const isFestivalExclusive = formData.get("isFestivalExclusive") === "true";

    const imageListRaw = formData.get("images") as string;
    let imageUrls: string[] = [];
    if (imageListRaw) {
      try { imageUrls = JSON.parse(imageListRaw); } catch { imageUrls = [imageListRaw]; }
    }

    if (!title || !price) {
      return { error: "Product Title and Display Price are required." };
    }

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) return { error: "Product not found." };

    if (sku && sku !== existingProduct.sku) {
      const skuCheck = await prisma.product.findUnique({ where: { sku } });
      if (skuCheck) return { error: `SKU "${sku}" is already assigned to another product.` };
    }

    await prisma.productImage.deleteMany({ where: { productId } });

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        sku: sku || existingProduct.sku,
        price,
        promoPrice,
        discount,
        description,
        craftsmanship,
        category,
        gender,
        material,
        colors,
        occasion,
        care,
        sizeGuide,
        sizes,
        collectionId: collectionId || null,
        featured,
        isNewArrival,
        isBestSeller,
        isFestivalExclusive,
        status,
        published: status === "PUBLISHED",
        archived: status === "ARCHIVED",
        images: {
          create: imageUrls.map((url) => ({ url }))
        }
      }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "PRODUCT_UPDATED",
      resourceType: "Product",
      resourceId: updated.id,
      metadata: { sku: updated.sku, title: updated.title, status: updated.status }
    });

    revalidatePath("/admin/products");
    revalidatePath(`/product/${updated.id}`);
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true, product: updated };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { error: "Failed to update product." };
  }
}

export async function duplicateProductAction(productId: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });
    if (!existing) return { error: "Product not found." };

    const newSku = await generateProductSku(existing.gender, existing.category);

    const duplicated = await prisma.product.create({
      data: {
        title: `${existing.title} (Copy)`,
        sku: newSku,
        price: existing.price,
        promoPrice: existing.promoPrice,
        discount: existing.discount,
        description: existing.description,
        craftsmanship: existing.craftsmanship,
        category: existing.category,
        gender: existing.gender,
        material: existing.material,
        colors: existing.colors,
        occasion: existing.occasion,
        care: existing.care,
        sizeGuide: existing.sizeGuide,
        sizes: existing.sizes,
        collectionId: existing.collectionId,
        featured: false,
        isNewArrival: true,
        isBestSeller: false,
        isFestivalExclusive: false,
        status: "DRAFT",
        published: false,
        archived: false,
        images: {
          create: existing.images.map((img) => ({ url: img.url }))
        }
      }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "PRODUCT_DUPLICATED",
      resourceType: "Product",
      resourceId: duplicated.id,
      metadata: { originalId: productId, newSku }
    });

    revalidatePath("/admin/products");
    return { success: true, product: duplicated };
  } catch (error) {
    console.error("Error duplicating product:", error);
    return { error: "Failed to duplicate product." };
  }
}

export async function archiveProductAction(productId: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: "ARCHIVED", archived: true, published: false }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "PRODUCT_ARCHIVED",
      resourceType: "Product",
      resourceId: productId
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true, product: updated };
  } catch (error) {
    return { error: "Failed to archive product." };
  }
}

export async function restoreProductAction(productId: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: "DRAFT", archived: false, published: false }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "PRODUCT_RESTORED",
      resourceType: "Product",
      resourceId: productId
    });

    revalidatePath("/admin/products");
    return { success: true, product: updated };
  } catch (error) {
    return { error: "Failed to restore product." };
  }
}

export async function deleteProductAction(productId: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    await prisma.product.delete({ where: { id: productId } });

    await logAdminAudit({
      adminId: admin.id,
      action: "PRODUCT_DELETED",
      resourceType: "Product",
      resourceId: productId
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete product." };
  }
}

export async function bulkArchiveProductsAction(productIds: string[]) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { status: "ARCHIVED", archived: true, published: false }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "PRODUCTS_BULK_ARCHIVED",
      resourceType: "Product",
      metadata: { count: productIds.length, productIds }
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    return { error: "Failed to bulk archive products." };
  }
}
