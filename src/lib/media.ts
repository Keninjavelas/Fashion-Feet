import { prisma } from "@/lib/prisma";
import { MEDIA_FOLDERS, MediaFolderId } from "./mediaConstants";

export { MEDIA_FOLDERS };
export type { MediaFolderId };

/**
 * Resolves a published visual asset URL dynamically from MediaAsset / SiteSetting with fallback.
 */
export async function getPublishedAsset(keyOrFolder: string, fallbackUrl: string = ""): Promise<string> {
  try {
    // 1. Check SiteSetting for branding/key assets
    const setting = await prisma.siteSetting.findUnique({ where: { key: keyOrFolder } }).catch(() => null);
    if (setting?.value) return setting.value;

    // 2. Query published MediaAsset matching name or folder (safely handled if client is reloading)
    let asset: any = null;
    try {
      asset = await (prisma.mediaAsset as any).findFirst({
        where: {
          status: "PUBLISHED",
          OR: [
            { name: { equals: keyOrFolder } },
            { folder: { equals: keyOrFolder } }
          ]
        },
        orderBy: { createdAt: "desc" }
      });
    } catch {
      // Fallback query for cached dev server instances without status column in memory
      asset = await (prisma.mediaAsset as any).findFirst({
        where: {
          OR: [
            { folder: { equals: keyOrFolder } }
          ]
        },
        orderBy: { createdAt: "desc" }
      }).catch(() => null);
    }

    return asset?.url || fallbackUrl;
  } catch (err) {
    console.error("getPublishedAsset error:", err);
    return fallbackUrl;
  }
}

/**
 * Calculates dependent storefront locations ("Used In") for any media asset to prevent accidental breakage.
 */
export async function calculateUsedInLocations(url: string, folder: string): Promise<string[]> {
  const locations: string[] = [];
  if (!url) return locations;

  try {
    // Check Site Settings usages
    const settings = await prisma.siteSetting.findMany().catch(() => []);
    settings.forEach(s => {
      if (s.value === url) {
        if (s.key.includes("primaryLogo")) locations.push("Header Logo", "Storefront Navbar");
        else if (s.key.includes("darkLogo") || s.key.includes("lightLogo")) locations.push("Footer Logo", "Admin Sidebar");
        else if (s.key.includes("favicon")) locations.push("Browser Favicon");
        else if (s.key.includes("heroImage")) locations.push("Homepage Hero Canvas");
        else if (s.key.includes("artisanImage")) locations.push("Craftsmanship Scroll Story");
        else if (s.key.includes("collection")) locations.push("Curated Collections Section");
        else locations.push(`Setting: ${s.key}`);
      }
    });

    // Check Product Image usages
    const productImages = await prisma.productImage.count({ where: { url: { equals: url } } }).catch(() => 0);
    if (productImages > 0) {
      locations.push(`Product Gallery (${productImages} Pair${productImages > 1 ? "s" : ""})`);
    }

    // Check Collection Banner usages
    const collections = await prisma.collection.count({ where: { banner: { equals: url } } }).catch(() => 0);
    if (collections > 0) {
      locations.push(`Collection Banner (${collections})`);
    }

    // Folder default mapping if not directly linked yet
    if (locations.length === 0) {
      if (folder === "branding") locations.push("Global Branding System");
      else if (folder === "homepage") locations.push("Homepage Visual Showcase");
      else if (folder === "products") locations.push("Showroom Product Catalog");
      else if (folder === "collections") locations.push("Curated Occasion Showcase");
      else if (folder === "festivals") locations.push("Active Festival Theme Drop");
      else if (folder === "stores") locations.push("Boutique Stores Finder");
      else if (folder === "backgrounds") locations.push("Ambient Texture Overlay");
    }
  } catch (err) {
    console.error("calculateUsedInLocations error:", err);
  }

  return Array.from(new Set(locations));
}
