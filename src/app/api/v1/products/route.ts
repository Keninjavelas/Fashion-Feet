import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parsePagination, publicGet, readFilter, type ListEnvelope } from "@/lib/publicApi";
import { serializeProduct, type PublicProduct } from "@/lib/publicSerializers";
import { findCatalogue } from "@/lib/catalogues";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/products
 *
 * Public catalogue listing. Only products the storefront itself would show are
 * returned — the same public visibility predicate the homepage
 * uses — so this endpoint cannot become a back door onto drafts or archived SKUs.
 *
 * Query: ?category= ?occasion= ?gender= ?collection= ?q= ?limit= ?offset=
 */
export async function GET(req: NextRequest) {
  return publicGet(req, async (): Promise<ListEnvelope<PublicProduct>> => {
    const { limit, offset } = parsePagination(req);
    const where: Prisma.ProductWhereInput = { archived: false, published: true, hidden: false };

    const categoryParam = readFilter(req, "category");
    if (categoryParam) {
      const name = await resolveCategoryName(categoryParam);
      // An unrecognised filter returns an empty page rather than the unfiltered
      // catalogue. Silently dropping a filter the caller asked for would show
      // the customer the wrong products, which is worse than showing none.
      if (!name) return emptyPage(limit, offset);
      where.category = name;
    }

    const occasionParam = readFilter(req, "occasion");
    if (occasionParam) {
      const name = await resolveOccasionName(occasionParam);
      if (!name) return emptyPage(limit, offset);
      where.occasion = name;
    }

    const genderParam = readFilter(req, "gender");
    if (genderParam) {
      const gender = genderParam.toLowerCase() === "men" ? "Men" : genderParam.toLowerCase() === "women" ? "Women" : null;
      if (!gender) return emptyPage(limit, offset);
      where.gender = { in: [gender, "Unisex"] };
    }

    const collectionParam = readFilter(req, "collection");
    if (collectionParam) {
      const id = await resolveCollectionId(collectionParam);
      if (!id) return emptyPage(limit, offset);
      where.collectionId = id;
    }

    const query = readFilter(req, "q");
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { category: { contains: query } },
        { occasion: { contains: query } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { images: true },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        skip: offset,
        take: limit,
      }),
    ]);

    return {
      data: products.map(serializeProduct),
      pagination: { total, limit, offset, hasMore: offset + products.length < total },
    };
  });
}

function emptyPage(limit: number, offset: number): ListEnvelope<PublicProduct> {
  return { data: [], pagination: { total: 0, limit, offset, hasMore: false } };
}

/**
 * Products store their category as a plain name string, not a foreign key, so a
 * filter has to be resolved against the Category table first. Accepts either the
 * slug or the display name, case-insensitively.
 */
async function resolveCategoryName(value: string): Promise<string | null> {
  const categories = await prisma.category.findMany({
    where: { active: true },
    select: { name: true, slug: true },
  });
  const needle = value.toLowerCase();
  const match = categories.find(
    (category) => category.slug.toLowerCase() === needle || category.name.toLowerCase() === needle
  );
  return match?.name ?? null;
}

async function resolveOccasionName(value: string): Promise<string | null> {
  return findCatalogue(value)?.name ?? null;
}

async function resolveCollectionId(value: string): Promise<string | null> {
  const collections = await prisma.collection.findMany({
    where: { visible: true, status: "PUBLISHED" },
    select: { id: true, title: true },
  });
  const needle = value.toLowerCase();
  const match = collections.find(
    (collection) => collection.id.toLowerCase() === needle || collection.title.toLowerCase() === needle
  );
  return match?.id ?? null;
}

export { preflight as OPTIONS } from "@/lib/publicApi";
