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

/** Resolve current content links in one set of database reads for a media library page. */
export async function calculateMediaUsageMap(urls: ReadonlyArray<string>): Promise<Record<string, string[]>> {
  const unique = Array.from(new Set(urls.filter(Boolean)));
  const usage = new Map(unique.map((url) => [url, new Set<string>()]));
  if (unique.length === 0) return {};

  const add = (url: string | null | undefined, label: string) => {
    if (url) usage.get(url)?.add(label);
  };
  const count = (values: Array<string | null | undefined>) => {
    const counts = new Map<string, number>();
    for (const value of values) if (value && usage.has(value)) counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  };

  const [settings, images, collections, festivals, content, configs, stores] = await Promise.all([
    prisma.siteSetting.findMany({ where: { value: { in: unique } }, select: { key: true, value: true } }).catch(() => []),
    prisma.productImage.findMany({ where: { url: { in: unique } }, select: { url: true } }).catch(() => []),
    prisma.collection.findMany({ select: { banner: true, thumbnail: true } }).catch(() => []),
    prisma.festival.findMany({ select: { heroBanner: true } }).catch(() => []),
    prisma.companyContent.findMany({ select: { content: true } }).catch(() => []),
    prisma.storefrontConfig.findMany({ select: { sections: true } }).catch(() => []),
    prisma.store.findMany({ select: { photos: true } }).catch(() => []),
  ]);

  for (const setting of settings) {
    const key = setting.key;
    const label = key.includes("primaryLogo") ? "Header Logo"
      : key.includes("darkLogo") || key.includes("lightLogo") ? "Footer Logo"
      : key.includes("favicon") ? "Browser Favicon"
      : key.includes("heroImage") ? "Homepage Hero Canvas"
      : key.includes("artisanImage") ? "Craftsmanship Scroll Story"
      : key.includes("collection") ? "Curated Collections Section"
      : `Setting: ${key}`;
    add(setting.value, label);
  }
  for (const [url, total] of count(images.map((image) => image.url))) add(url, `Product Gallery (${total})`);
  for (const [url, total] of count(collections.map((collection) => collection.banner))) add(url, `Collection Banner (${total})`);
  for (const [url, total] of count(collections.map((collection) => collection.thumbnail))) add(url, `Collection Thumbnail (${total})`);
  for (const [url, total] of count(festivals.map((festival) => festival.heroBanner))) add(url, `Festival Banner (${total})`);
  for (const [url, total] of count(content.map((entry) => entry.content))) add(url, `Company Content (${total})`);

  for (const url of unique) {
    if (configs.some((config) => config.sections.includes(url))) add(url, "Storefront Studio");
    if (stores.some((store) => store.photos?.includes(url))) add(url, "Store Photos");
  }

  return Object.fromEntries(Array.from(usage, ([url, labels]) => [url, Array.from(labels)]));
}

export async function calculateUsedInLocations(url: string, _folder: string): Promise<string[]> {
  if (!url) return [];
  return (await calculateMediaUsageMap([url]))[url] || [];
}

export type ManagedUrlValidation =
  | { ok: true; urls: string[] }
  | { ok: false; invalid: string[] };

/**
 * Ensures every supplied image URL is backed by a MediaAsset.
 *
 * Storefront imagery must flow through the media system. Without this check the
 * product actions accept any string, which is how unmanaged external hotlinks
 * (e.g. third-party stock photo URLs) enter the catalogue.
 */
export async function validateManagedImageUrls(
  urls: ReadonlyArray<string>
): Promise<ManagedUrlValidation> {
  const cleaned = Array.from(
    new Set(urls.map((u) => (typeof u === "string" ? u.trim() : "")).filter(Boolean))
  );
  if (cleaned.length === 0) return { ok: true, urls: [] };

  const assets = await prisma.mediaAsset
    .findMany({ where: { url: { in: cleaned } }, select: { url: true } })
    .catch(() => []);
  const managed = new Set(assets.map((a) => a.url));

  const invalid = cleaned.filter((url) => !managed.has(url));
  if (invalid.length > 0) return { ok: false, invalid };

  return { ok: true, urls: cleaned };
}

/**
 * Recomputes the cached "Used In" labels for the given asset URLs so the Media
 * Library reflects where an asset is attached after a content change.
 */
export async function refreshMediaUsage(urls: ReadonlyArray<string>): Promise<void> {
  const unique = Array.from(new Set(urls.filter(Boolean)));
  const usage = await calculateMediaUsageMap(unique);
  for (const url of unique) {
    const asset = await prisma.mediaAsset.findFirst({ where: { url } }).catch(() => null);
    if (!asset) continue;
    const usedIn = usage[url] || [];
    await prisma.mediaAsset
      .update({ where: { id: asset.id }, data: { usedIn: JSON.stringify(usedIn) } })
      .catch(() => null);
  }
}

/** Replace a managed file and keep every current content reference pointing at it. */
export async function replaceManagedMediaAsset(
  assetId: string,
  newUrl: string,
  fileSize: string,
  filename: string
) {
  const existing = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
  if (!existing || existing.status === "TRASH") throw new Error("Asset not found.");
  const oldUrl = existing.url;

  const asset = await prisma.$transaction(async (tx) => {
    await tx.productImage.updateMany({ where: { url: oldUrl }, data: { url: newUrl } });
    await tx.collection.updateMany({ where: { banner: oldUrl }, data: { banner: newUrl } });
    await tx.collection.updateMany({ where: { thumbnail: oldUrl }, data: { thumbnail: newUrl } });
    await tx.festival.updateMany({ where: { heroBanner: oldUrl }, data: { heroBanner: newUrl } });
    await tx.siteSetting.updateMany({ where: { value: oldUrl }, data: { value: newUrl } });
    await tx.companyContent.updateMany({ where: { content: oldUrl }, data: { content: newUrl } });

    const configs = await tx.storefrontConfig.findMany({ where: { sections: { contains: oldUrl } } });
    for (const config of configs) {
      const sections = JSON.parse(config.sections) as Array<{ image?: string; mediaAssetId?: string }>;
      let changed = false;
      for (const section of sections) {
        if (section.image === oldUrl || section.mediaAssetId === assetId) {
          section.image = newUrl;
          changed = true;
        }
      }
      if (changed) await tx.storefrontConfig.update({ where: { id: config.id }, data: { sections: JSON.stringify(sections) } });
    }

    const stores = await tx.store.findMany({ where: { photos: { contains: oldUrl } } });
    for (const store of stores) {
      const photos = JSON.parse(store.photos || "[]") as string[];
      if (Array.isArray(photos) && photos.includes(oldUrl)) {
        await tx.store.update({ where: { id: store.id }, data: { photos: JSON.stringify(photos.map((url) => url === oldUrl ? newUrl : url)) } });
      }
    }

    return tx.mediaAsset.update({
      where: { id: assetId },
      data: { url: newUrl, filename, fileSize }
    });
  });

  await refreshMediaUsage([newUrl]);
  return asset;
}
