import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { PublicApiError, publicGet } from "@/lib/publicApi";
import { serializeProduct } from "@/lib/publicSerializers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/products/:id
 *
 * Looks a product up by its cuid `id` or by its `sku` (accepting either makes
 * deep links workable, since the storefront routes by id while packaging and
 * label artwork carry the SKU).
 *
 * Note this applies the same public predicate as the listing. The web product
 * page does NOT filter on `published`/`archived`, so an unpublished product is
 * reachable on the site by anyone who knows its id. This endpoint deliberately
 * does not inherit that behaviour.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  return publicGet(req, async () => {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }], archived: false, published: true },
      include: { images: true },
    });

    if (!product) {
      // A clean 404, not a 500 and not a stack trace.
      throw new PublicApiError(404, "Product not found");
    }

    return { data: serializeProduct(product) };
  });
}

export { preflight as OPTIONS } from "@/lib/publicApi";
