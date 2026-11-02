import { NextRequest } from "next/server";
import { publicGet } from "@/lib/publicApi";
import { CATALOGUES } from "@/lib/catalogues";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/occasions
 *
 * Business catalogues, including the women-only Rajwadi and men-only Functional and Office Wear groups. Product records store the display name in
 * their occasion field; the public API keeps the historical endpoint name.
 */
export async function GET(req: NextRequest) {
  return publicGet(req, async () => {
    return { data: CATALOGUES.map((catalogue, displayOrder) => ({
      id: catalogue.slug,
      name: catalogue.name,
      slug: catalogue.slug,
      genders: catalogue.slug === "rajwadi" ? ["Women"] : catalogue.slug === "functional" || catalogue.slug === "office-wear" ? ["Men"] : ["Men", "Women", "Unisex"],
      description: null,
      displayOrder,
    })) };
  });
}

export { preflight as OPTIONS } from "@/lib/publicApi";
