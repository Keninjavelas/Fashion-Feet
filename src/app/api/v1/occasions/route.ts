import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicGet } from "@/lib/publicApi";
import { serializeOccasion } from "@/lib/publicSerializers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/occasions
 *
 * Active occasions only, in display order. Products reference an occasion by
 * name string, so the `name` here is the value to pass back as the
 * `?occasion=` filter on /api/v1/products.
 */
export async function GET(req: NextRequest) {
  return publicGet(req, async () => {
    const occasions = await prisma.occasion.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    return { data: occasions.map(serializeOccasion) };
  });
}

export { preflight as OPTIONS } from "@/lib/publicApi";
