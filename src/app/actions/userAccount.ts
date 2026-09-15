"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";

export async function exportUserData() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Unauthenticated. Please log in to export your data." };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wishlists: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                category: true,
                gender: true,
              }
            }
          }
        }
      }
    });

    if (!user) {
      return { error: "User account not found." };
    }

    // Format exporting JSON payload
    const exportData = {
      exportMetadata: {
        platform: "Fashion Feet Digital Showroom",
        exportedAt: new Date().toISOString(),
        userAccountId: user.id,
      },
      profileInformation: {
        name: user.name,
        email: user.email,
        phone: user.phone || "Not provided",
        role: user.role,
        accountStatus: user.active ? "Active" : "Deactivated",
        registeredOn: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
      },
      sizePreference: {
        savedSize: user.size || "No size preference saved",
      },
      preferences: user.preferences ? JSON.parse(user.preferences) : null,
      notificationPreferences: user.notifications ? JSON.parse(user.notifications) : null,
      savedFavorites: user.wishlists.map(w => ({
        savedAt: w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "N/A",
        product: w.product
      }))
    };

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting user data:", error);
    return { error: "Failed to generate data export." };
  }
}

export async function verifyUserPassword(password: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Unauthenticated." };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return { error: "Account not found." };
    }

    const check = await verifyPassword(password, user.password || "");
    if (!check.valid) {
      return { error: "Incorrect password. Please verify and try again." };
    }

    return { success: true };
  } catch (error) {
    return { error: "Failed to verify password." };
  }
}

export async function deleteUserAccount(password: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Unauthenticated." };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return { error: "Account not found." };
    }

    const deletionCheck = await verifyPassword(password, user.password || "");
    if (!deletionCheck.valid) {
      return { error: "Incorrect password. Account deletion aborted." };
    }

    // Cascade delete user record and all associated relations
    await prisma.user.delete({
      where: { id: user.id }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { error: "Failed to delete account. Please try again later." };
  }
}
