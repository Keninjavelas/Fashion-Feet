"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to save products." };
  }
  
  const existing = await prisma.wishlist.findFirst({
    where: { 
      userId: session.user.id, 
      productId 
    }
  });

  if (existing) {
    await prisma.wishlist.delete({ 
      where: { id: existing.id } 
    });
  } else {
    await prisma.wishlist.create({ 
      data: { 
        userId: session.user.id, 
        productId 
      } 
    });
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/product/[id]", "page");
  revalidatePath("/profile/favorites");
  
  return { success: true, isWishlisted: !existing };
}

export async function getWishlistCount() {
  const session = await auth();
  if (!session?.user?.id) {
    return 0;
  }
  
  const count = await prisma.wishlist.count({
    where: { userId: session.user.id }
  });
  
  return count;
}
