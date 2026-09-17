import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicGet } from "@/lib/publicApi";
import { serializeCollection } from "@/lib/publicSerializers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/collections
 *
 * Only collections that are both visible and PUBLISHED. A DRAFT collection is a
 * merchandising work-in-progress and must not surface here.
 *
 * (This table is currently empty in the seeded database; the endpoint returns an
 * empty array rather than 404, so a client can call it unconditionally.)
 */
export async function GET(req: NextRequest) {
  return publicGet(req, async () => {
    const collections = await prisma.collection.findMany({
      where: { visible: true, status: "PUBLISHED" },
      orderBy: [{ displayOrder: "asc" }, { title: "asc" }],
    });

    return { data: collections.map(serializeCollection) };
  });
}

export { preflight as OPTIONS } from "@/lib/publicApi";
