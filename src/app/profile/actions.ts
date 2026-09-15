"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePreferences(preferences: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { preferences },
    });
    revalidatePath("/profile");
    revalidatePath("/profile/preferences");
    return { success: true };
  } catch (error) {
    console.error("Failed to update preferences:", error);
    return { error: "Failed to update preferences" };
  }
}

export async function updateSize(size: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { size },
    });
    revalidatePath("/profile");
    revalidatePath("/profile/size");
    return { success: true };
  } catch (error) {
    console.error("Failed to update size:", error);
    return { error: "Failed to update size" };
  }
}

export async function updateSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  // Note: Email should typically require verification to change, so we omit it or allow it based on requirements.
  
  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { name, phone },
    });
    revalidatePath("/profile/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { error: "Failed to update settings" };
  }
}

export async function updateNotifications(notifications: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { notifications },
    });
    revalidatePath("/profile");
    revalidatePath("/profile/notifications");
    return { success: true };
  } catch (error) {
    console.error("Failed to update notifications:", error);
    return { error: "Failed to update notifications" };
  }
}
