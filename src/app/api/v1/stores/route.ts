import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicGet } from "@/lib/publicApi";
import { serializeStore } from "@/lib/publicSerializers";

export const dynamic = "force-dynamic";

/**
 * Statuses a customer is allowed to see. DRAFT is an unpublished location being
 * set up, and ARCHIVED is a closed one — neither belongs on a public endpoint.
 */
const PUBLIC_STORE_STATUSES = ["OPEN", "COMING_SOON", "TEMPORARILY_CLOSED"] as const;

/**
 * GET /api/v1/stores
 *
 * Public store details. `managerName` is dropped by the serializer — it is a
 * named individual's internal contact, not storefront content.
 */
export async function GET(req: NextRequest) {
  return publicGet(req, async () => {
    const stores = await prisma.store.findMany({
      where: { status: { in: [...PUBLIC_STORE_STATUSES] } },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    return { data: stores.map(serializeStore) };
  });
}

export { preflight as OPTIONS } from "@/lib/publicApi";
