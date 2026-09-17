import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicGet } from "@/lib/publicApi";
import { PUBLIC_APPEARANCE_KEYS, serializeAppearance } from "@/lib/publicSerializers";
import { DEFAULT_HOMEPAGE_SECTIONS, DEFAULT_PAGE_CONFIGS, type StorefrontSection } from "@/lib/storefrontConfig";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/site
 *
 * The storefront's public configuration: the appearance tokens and the PUBLISHED
 * homepage composition, so a native client can render the home screen without
 * hardcoding layout decisions that merchandisers control in the admin console.
 *
 * Two deliberate exclusions:
 *
 *  1. Only the PUBLISHED StorefrontConfig row is read. The DRAFT row is the
 *     merchandiser's unpublished sandbox — serving it would leak campaigns before
 *     they go live.
 *  2. The `select` omits `lastEditedById`. That column holds an AdminUser id, and
 *     this is an unauthenticated endpoint: no admin identifier belongs in it.
 */
export async function GET(req: NextRequest) {
  return publicGet(
    req,
    async () => {
      const [siteRows, companyRows, published] = await Promise.all([
        prisma.siteSetting.findMany({
          where: { key: { in: [...PUBLIC_APPEARANCE_KEYS] } },
          select: { key: true, value: true },
        }),
        // `status: "PUBLISHED"` because CompanyContent has a draft state.
        prisma.companyContent.findMany({
          where: { key: { in: [...PUBLIC_APPEARANCE_KEYS] }, status: "PUBLISHED" },
          select: { key: true, content: true },
        }),
        prisma.storefrontConfig.findUnique({
          where: { page_status: { page: "homepage", status: "PUBLISHED" } },
          select: { version: true, publishedAt: true, sections: true },
        }),
      ]);

      // CompanyContent first, then SiteSetting overriding it — the same
      // precedence the storefront uses in getSiteSettingsMap(), so the API and
      // the website cannot disagree about a colour.
      const values: Record<string, string> = {};
      for (const row of companyRows) values[row.key] = row.content;
      for (const row of siteRows) values[row.key] = row.value;

      let sections: StorefrontSection[] = DEFAULT_PAGE_CONFIGS["homepage"] || DEFAULT_HOMEPAGE_SECTIONS;
      if (published?.sections) {
        try {
          const parsed: unknown = JSON.parse(published.sections);
          if (Array.isArray(parsed)) sections = parsed as StorefrontSection[];
        } catch {
          // A malformed sections blob degrades to the built-in defaults rather
          // than 500-ing the mobile home screen.
          console.error("[api/v1/site] published homepage sections were not valid JSON");
        }
      }

      return {
        data: {
          appearance: serializeAppearance(values),
          homepage: {
            page: "homepage",
            version: published?.version ?? null,
            publishedAt: published?.publishedAt?.toISOString() ?? null,
            sections,
          },
        },
      };
    },
    { cacheSeconds: 120 }
  );
}

export { preflight as OPTIONS } from "@/lib/publicApi";
