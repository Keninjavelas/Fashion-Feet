"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";

export async function toggleUserActive(userId: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) return { error: "User not found." };

    await prisma.user.update({
      where: { id: userId },
      data: { active: !existing.active }
    });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update user status." };
  }
}

export async function updateUserProfile(data: { name?: string; phone?: string; size?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Unauthenticated. Please sign in." };
    }

    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.size && { size: data.size }),
      }
    });

    revalidatePath("/profile");
    revalidatePath("/size-guide");
    // Never echo credential material (password hash, mfaSecret) back to the client.
    return {
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        size: updated.size,
      },
    };
  } catch (error) {
    console.error("updateUserProfile error:", error);
    return { error: "Failed to update profile details." };
  }
}
