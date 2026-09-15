"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { SUPPORTED_SEASONAL_KEYS, SEASONAL_ATMOSPHERES, SeasonalThemeKey } from "@/lib/seasonalConstants";

/**
 * Sanitizes user copy to prevent XSS payloads.
 */
function sanitizeText(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/**
 * Resolves the currently active festival experience:
 * 1. Highest priority: Explicitly manually enabled festival (`enabled: true`).
 * 2. Second priority: Auto-activating scheduled campaign within valid temporal window (`startDate <= now <= endDate`).
 * 3. Fallback: null (maps to Default Atelier mode).
 */
export async function getActiveFestival() {
  try {
    const now = new Date();

    // 1. Check for manually enabled active festival
    const manualActive = await prisma.festival.findFirst({
      where: { enabled: true },
      include: { mediaAsset: true }
    });

    if (manualActive) {
      // If manual active has autoDisable enabled and time has elapsed, auto-revert to disabled
      if (manualActive.autoDisable && manualActive.endDate < now) {
        await prisma.festival.update({
          where: { id: manualActive.id },
          data: { enabled: false, status: "COMPLETED" }
        }).catch(() => null);
      } else {
        return manualActive;
      }
    }

    // 2. Check for scheduled festival with autoActivate within date window
    const scheduledActive = await prisma.festival.findFirst({
      where: {
        autoActivate: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: { startDate: "desc" },
      include: { mediaAsset: true }
    });

    if (scheduledActive) {
      return scheduledActive;
    }

    return null;
  } catch (error) {
    console.error("Error resolving active festival:", error);
    return null;
  }
}

/**
 * Retrieves the comprehensive list of 7 seasonal atmospheres for the Studio UI.
 */
export async function getFestivalStudioList() {
  try {
    const dbFestivals = await prisma.festival.findMany({
      include: { mediaAsset: true },
      orderBy: { createdAt: "asc" }
    });

    const dbMap = new Map(dbFestivals.map((f) => [f.theme.toLowerCase(), f]));

    // Return complete list ensuring all 7 supported themes exist
    return SUPPORTED_SEASONAL_KEYS.map((key) => {
      const existing = dbMap.get(key);
      const canonical = SEASONAL_ATMOSPHERES[key];

      if (existing) {
        return existing;
      }

      // Default mock object for unconfigured atmospheres
      return {
        id: `virtual-${key}`,
        name: canonical.label,
        theme: key,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        enabled: false,
        status: "INACTIVE",
        description: `Bespoke seasonal atmosphere curated for ${canonical.label}.`,
        heroSubtitle: "Handcrafted Luxury Heritage Footwear",
        heroBanner: null,
        mediaAssetId: null,
        mediaAsset: null,
        accentColor: canonical.accentColor,
        announcement: `${canonical.label} Celebration — In-Store Boutique Consultation Available`,
        announcementActive: true,
        animation: canonical.particleType === "diyas" ? "floating-diyas" :
                   canonical.particleType === "colors" ? "gulal-powder" :
                   canonical.particleType === "crescent" ? "crescent-lanterns" :
                   canonical.particleType === "snow" ? "snowfall" :
                   canonical.particleType === "fire" ? "bonfire-embers" :
                   canonical.particleType === "harvest" ? "wheat-chaff" : "floating-diyas",
        effectIntensity: "BALANCED",
        badgeText: canonical.badgeText,
        offerHeading: `${canonical.label} Celebration Boutique Offer`,
        offerDescription: "Visit our atelier for customized hand-embroidered wedding & festive juttis.",
        ctaText: "Explore Festive Collection",
        discountPercentage: null,
        discountScope: "FESTIVAL_COLLECTION",
        productIds: "[]",
        autoActivate: true,
        autoDisable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
  } catch (error) {
    console.error("Error retrieving festival studio list:", error);
    return [];
  }
}

/**
 * Saves or updates a Festival Studio configuration.
 */
export async function saveFestivalStudioAction(data: any) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return { error: "Unauthorized. Please sign in to administrator console." };
    }

    const {
      id,
      name,
      theme,
      startDate,
      endDate,
      description,
      heroSubtitle,
      mediaAssetId,
      accentColor,
      announcement,
      announcementActive,
      animation,
      effectIntensity,
      badgeText,
      offerHeading,
      offerDescription,
      ctaText,
      discountPercentage,
      discountScope,
      productIds,
      autoActivate,
      autoDisable,
      status
    } = data;

    if (!name || !startDate || !endDate) {
      return { error: "Festival Name, Start Date, and End Date are required." };
    }

    // Resolve media asset URL if mediaAssetId is provided
    let heroBanner: string | null = null;
    if (mediaAssetId) {
      const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaAssetId } });
      if (asset) heroBanner = asset.url;
    }

    const payload = {
      name: sanitizeText(name),
      theme: (theme || "default").toLowerCase(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description: sanitizeText(description),
      heroSubtitle: sanitizeText(heroSubtitle),
      heroBanner,
      mediaAssetId: mediaAssetId || null,
      accentColor: accentColor || "#D4AF37",
      announcement: sanitizeText(announcement),
      announcementActive: announcementActive !== false,
      animation: animation || "floating-diyas",
      effectIntensity: effectIntensity || "BALANCED",
      badgeText: sanitizeText(badgeText),
      offerHeading: sanitizeText(offerHeading),
      offerDescription: sanitizeText(offerDescription),
      ctaText: sanitizeText(ctaText) || "Explore Festive Collection",
      discountPercentage: discountPercentage ? parseFloat(discountPercentage) : null,
      discountScope: discountScope || "FESTIVAL_COLLECTION",
      productIds: Array.isArray(productIds) ? JSON.stringify(productIds) : (productIds || "[]"),
      autoActivate: autoActivate !== false,
      autoDisable: autoDisable !== false,
      status: status || "SCHEDULED"
    };

    let festival;
    if (id && !id.startsWith("virtual-")) {
      festival = await prisma.festival.update({
        where: { id },
        data: payload,
        include: { mediaAsset: true }
      });
    } else {
      // Upsert by theme if exists, otherwise create
      const existingByTheme = await prisma.festival.findFirst({ where: { theme: payload.theme } });
      if (existingByTheme) {
        festival = await prisma.festival.update({
          where: { id: existingByTheme.id },
          data: payload,
          include: { mediaAsset: true }
        });
      } else {
        festival = await prisma.festival.create({
          data: payload,
          include: { mediaAsset: true }
        });
      }
    }

    await logAdminAudit({
      adminId: admin.id,
      action: "FESTIVAL_STUDIO_UPDATED",
      resourceType: "Festival",
      resourceId: festival.id,
      metadata: { theme: festival.theme, name: festival.name }
    });

    revalidatePath("/admin/festivals");
    revalidatePath("/");
    revalidatePath("/festive");
    revalidatePath("/shop");

    return { success: true, festival };
  } catch (error: any) {
    console.error("Error saving festival studio configuration:", error);
    return { error: error.message || "Failed to save seasonal experience." };
  }
}

/**
 * Super Admin One-Click Instant Live Activation.
 */
export async function activateFestivalNowAction(id: string) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return { error: "Unauthorized." };
    if (admin.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized. Super Admin role required to activate seasonal experiences live." };
    }

    // Deactivate all others first (single active festival rule)
    await prisma.festival.updateMany({
      where: { enabled: true },
      data: { enabled: false, status: "INACTIVE" }
    });

    // Activate selected festival
    const festival = await prisma.festival.update({
      where: { id },
      data: {
        enabled: true,
        status: "ACTIVE"
      },
      include: { mediaAsset: true }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "FESTIVAL_ACTIVATED",
      resourceType: "Festival",
      resourceId: festival.id,
      metadata: { theme: festival.theme, name: festival.name }
    });

    revalidatePath("/admin/festivals");
    revalidatePath("/");
    revalidatePath("/festive");
    revalidatePath("/shop");

    return { success: true, festival };
  } catch (error: any) {
    console.error("Error activating festival live:", error);
    return { error: error.message || "Failed to activate seasonal experience." };
  }
}

/**
 * Super Admin One-Click Instant Deactivation (reverts to Default Atelier).
 */
export async function deactivateFestivalAction(id: string) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return { error: "Unauthorized." };
    if (admin.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized. Super Admin role required." };
    }

    const festival = await prisma.festival.update({
      where: { id },
      data: {
        enabled: false,
        status: "INACTIVE"
      }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "FESTIVAL_DEACTIVATED",
      resourceType: "Festival",
      resourceId: festival.id,
      metadata: { theme: festival.theme, name: festival.name }
    });

    revalidatePath("/admin/festivals");
    revalidatePath("/");
    revalidatePath("/festive");
    revalidatePath("/shop");

    return { success: true };
  } catch (error: any) {
    console.error("Error deactivating festival:", error);
    return { error: error.message || "Failed to deactivate seasonal experience." };
  }
}

/**
 * Duplicates a seasonal campaign for future scheduling.
 */
export async function duplicateFestivalCampaign(id: string) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return { error: "Unauthorized." };

    const existing = await prisma.festival.findUnique({ where: { id } });
    if (!existing) return { error: "Original campaign not found." };

    const duplicated = await prisma.festival.create({
      data: {
        name: `${existing.name} (Upcoming Edition)`,
        theme: existing.theme,
        startDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Next year
        endDate: new Date(Date.now() + 380 * 24 * 60 * 60 * 1000),
        description: existing.description,
        heroSubtitle: existing.heroSubtitle,
        heroBanner: existing.heroBanner,
        mediaAssetId: existing.mediaAssetId,
        accentColor: existing.accentColor,
        announcement: existing.announcement,
        announcementActive: existing.announcementActive,
        animation: existing.animation,
        effectIntensity: existing.effectIntensity,
        badgeText: existing.badgeText,
        offerHeading: existing.offerHeading,
        offerDescription: existing.offerDescription,
        ctaText: existing.ctaText,
        discountPercentage: existing.discountPercentage,
        discountScope: existing.discountScope,
        productIds: existing.productIds,
        autoActivate: existing.autoActivate,
        autoDisable: existing.autoDisable,
        enabled: false,
        status: "SCHEDULED"
      }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "FESTIVAL_DUPLICATED",
      resourceType: "Festival",
      resourceId: duplicated.id
    });

    revalidatePath("/admin/festivals");
    return { success: true, festival: duplicated };
  } catch (error) {
    console.error("Error duplicating campaign:", error);
    return { error: "Failed to duplicate campaign." };
  }
}

/**
 * Deletes a seasonal campaign.
 */
export async function deleteFestival(id: string) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin || admin.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized. Super Admin role required to delete campaign." };
    }

    await prisma.festival.delete({ where: { id } });

    await logAdminAudit({
      adminId: admin.id,
      action: "FESTIVAL_DELETED",
      resourceType: "Festival",
      resourceId: id
    });

    revalidatePath("/admin/festivals");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete campaign." };
  }
}
