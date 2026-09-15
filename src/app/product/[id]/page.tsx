import { prisma } from "@/lib/prisma";
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true }
  });

  if (!product) {
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
