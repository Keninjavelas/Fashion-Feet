import { cache } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductClient from "./ProductClient";
import { auth } from "@/auth";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { notFound } from "next/navigation";

// Deduplicated per request so generateMetadata and the page share one lookup.
const getProduct = cache((id: string) =>
  prisma.product.findFirst({ where: { id, published: true, archived: false, hidden: false }, include: { images: true } })
);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    // An unknown product is answered with the storefront 404 experience. The
    // response itself cannot carry a 404 status (see the note in ProductPage),
    // so the URL is explicitly kept out of search results.
    return { title: "Page Not Found", robots: { index: false, follow: false } };
  }

  return {};
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const product = await getProduct(id);

  if (!product) {
    // A missing product MUST answer HTTP 404. Rendering a 404-looking view with a
    // 200 status would tell crawlers and API clients that the page exists, which is
    // worse than an ugly page: a false 200 gets indexed and cached, while a real 404
    // is handled correctly by every client.
    //
    // KNOWN DEFECT (open): in this Next 16.2.10 build the served document for a
    // notFound() thrown from a nested page segment is an empty
    // <html id="__next_error__"> shell, so a no-JS visitor sees nothing until
    // hydration — even though a genuinely unmatched route renders the full styled
    // 404 shell (with nav and footer) correctly. The correct status is deliberately
    // kept in preference to a visible body until the shell issue is root-caused.
    notFound();
  }

  let initialIsWishlisted = false;
  if (session?.user?.id) {
    const wishlist = await prisma.wishlist.findFirst({
      where: { userId: session.user.id, productId: id }
    });
    initialIsWishlisted = !!wishlist;
  }

  return (
    <StorefrontLayout>
      <ProductClient product={product} initialIsWishlisted={initialIsWishlisted} />
    </StorefrontLayout>
  );
}
