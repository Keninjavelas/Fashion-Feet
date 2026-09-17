import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicGet } from "@/lib/publicApi";
import { serializeCategory, type PublicCategory } from "@/lib/publicSerializers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/categories
 *
 * Active categories only, in display order. Mirrors the taxonomy the storefront
 * filters by — this table holds product TYPES (e.g. Jutti, Mojari), while gender
 * and occasion live on the product itself.
 */
export async function GET(req: NextRequest) {
  return publicGet(req, async () => {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    return { data: categories.map(serializeCategory) satisfies PublicCategory[] };
  });
}

export { preflight as OPTIONS } from "@/lib/publicApi";
