import { NextRequest } from "next/server";
import { publicGet } from "@/lib/publicApi";
import { CATALOGUES } from "@/lib/catalogues";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/occasions
 *
 * The three business catalogues. Product records store the display name in
 * their occasion field; the public API keeps the historical endpoint name.
 */
export async function GET(req: NextRequest) {
  return publicGet(req, async () => {
    return { data: CATALOGUES.map((catalogue, displayOrder) => ({
      id: catalogue.slug,
      name: catalogue.name,
      slug: catalogue.slug,
      description: null,
      displayOrder,
    })) };
  });
}

export { preflight as OPTIONS } from "@/lib/publicApi";
