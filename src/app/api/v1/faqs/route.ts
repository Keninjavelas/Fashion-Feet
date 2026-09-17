import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicGet } from "@/lib/publicApi";
import { serializeFaq } from "@/lib/publicSerializers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/faqs
 *
 * Pinned entries first, then display order — the same ordering the storefront
 * uses.
 *
 * There is no draft/hidden concept on the `Faq` model, so every row is public.
 * That is a property of the schema, not an oversight in this query: there is no
 * column to filter on. If unpublished FAQs are ever required, the schema needs a
 * column and this handler needs a matching filter.
 */
export async function GET(req: NextRequest) {
  return publicGet(req, async () => {
    const faqs = await prisma.faq.findMany({
      orderBy: [{ isPinned: "desc" }, { displayOrder: "asc" }],
    });

    return { data: faqs.map(serializeFaq) };
  });
}

export { preflight as OPTIONS } from "@/lib/publicApi";
