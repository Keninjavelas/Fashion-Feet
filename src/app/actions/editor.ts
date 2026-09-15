"use server";

import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";
import {
  getDraftStorefrontConfig,
  saveDraftStorefrontConfig,
  publishStorefrontConfig,
  getStorefrontVersionHistory,
  rollbackStorefrontVersion,
  StorefrontSection
} from "@/lib/storefrontConfig";
import { safeRevalidatePath } from "@/lib/revalidate";

export async function loadPageDraftAction(page: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  const data = await getDraftStorefrontConfig(page);
  return { success: true, ...data };
}

const ALLOWED_STYLE_PRESETS = ["DARK_ROYAL", "LIGHT_GOLD", "GLASS"];
const ALLOWED_MOTION_PRESETS = ["NONE", "FADE_UP", "REVEAL", "STAGGER", "PARALLAX"];

function sanitizeText(str?: string): string {
  if (!str) return "";
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

export async function savePageDraftAction(page: string, sections: StorefrontSection[]) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    // Sanitize and validate sections
    const sanitizedSections: StorefrontSection[] = sections.map((sec) => {
      const stylePreset = ALLOWED_STYLE_PRESETS.includes(sec.stylePreset || "") ? sec.stylePreset : "DARK_ROYAL";
      const motionPreset = ALLOWED_MOTION_PRESETS.includes(sec.motionPreset || "") ? sec.motionPreset : "FADE_UP";

      return {
        ...sec,
        title: sanitizeText(sec.title),
        subtitle: sanitizeText(sec.subtitle),
        badge: sanitizeText(sec.badge),
        description: sanitizeText(sec.description),
        ctaText: sanitizeText(sec.ctaText),
        ctaLink: sanitizeText(sec.ctaLink),
        image: sanitizeText(sec.image),
        stylePreset,
        motionPreset
      };
    });

    const draft = await saveDraftStorefrontConfig(page, sanitizedSections, admin.id);

    await logAdminAudit({
      adminId: admin.id,
      action: "DRAFT_SAVED",
      resourceType: "StorefrontConfig",
      resourceId: page,
      metadata: { sectionCount: sanitizedSections.length }
    });

    return { success: true, updatedAt: draft.updatedAt };
  } catch (error) {
    console.error("Error saving page draft:", error);
    return { error: "Failed to save draft." };
  }
}

export async function publishPageConfigAction(page: string, changelogNote?: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  // RBAC Safeguard: SUPER_ADMIN required for live publishing
  if (admin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Super Admin role required to publish live storefront changes." };
  }

  try {
    const published = await publishStorefrontConfig(page, admin.id, changelogNote);

    await logAdminAudit({
      adminId: admin.id,
      action: "PAGE_PUBLISHED",
      resourceType: "StorefrontConfig",
      resourceId: page,
      metadata: { version: published.version, publishedAt: published.publishedAt, changelogNote }
    });

    // Revalidate public storefront cache
    safeRevalidatePath("/");
    safeRevalidatePath("/men");
    safeRevalidatePath("/women");
    safeRevalidatePath("/about");
    safeRevalidatePath("/contact");
    safeRevalidatePath("/stores");

    return { success: true, publishedAt: published.publishedAt, version: published.version };
  } catch (error: any) {
    console.error("Error publishing page config:", error);

    await logAdminAudit({
      adminId: admin.id,
      action: "PAGE_PUBLISH_FAILED",
      resourceType: "StorefrontConfig",
      resourceId: page,
      metadata: { error: error?.message || "Publish transaction failed" }
    }).catch(() => {});

    return { error: "Failed to publish storefront configuration." };
  }
}

export async function getVersionHistoryAction(page: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const history = await getStorefrontVersionHistory(page);
    return { success: true, history };
  } catch (error) {
    console.error("Error loading version history:", error);
    return { error: "Failed to load version history." };
  }
}

export async function rollbackVersionAction(page: string, targetVersion: number) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  if (admin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Super Admin role required to rollback live configurations." };
  }

  try {
    const restored = await rollbackStorefrontVersion(page, targetVersion, admin.id);

    await logAdminAudit({
      adminId: admin.id,
      action: "STOREFRONT_ROLLED_BACK",
      resourceType: "StorefrontConfig",
      resourceId: page,
      metadata: { restoredVersion: targetVersion, newVersion: restored.version }
    });

    safeRevalidatePath("/");
    safeRevalidatePath("/men");
    safeRevalidatePath("/women");
    safeRevalidatePath("/about");
    safeRevalidatePath("/stores");

    return { success: true, version: restored.version, publishedAt: restored.publishedAt };
  } catch (error: any) {
    console.error("Error rolling back storefront version:", error);
    return { error: error.message || "Failed to rollback version." };
  }
}

export async function discardPageDraftAction(page: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const published = await getDraftStorefrontConfig(page);
    await saveDraftStorefrontConfig(page, published.sections, admin.id);

    await logAdminAudit({
      adminId: admin.id,
      action: "DRAFT_DISCARDED",
      resourceType: "StorefrontConfig",
      resourceId: page
    });

    return { success: true, sections: published.sections };
  } catch (error) {
    return { error: "Failed to discard draft changes." };
  }
}
