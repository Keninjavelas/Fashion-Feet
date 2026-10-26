"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

export async function saveSiteSettings(category: string, settingsObj: Record<string, any>) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const entries = Object.entries(settingsObj);
    for (const [key, value] of entries) {
      const valStr = typeof value === "object" ? JSON.stringify(value) : String(value);

      if ((prisma as any).siteSetting) {
        await (prisma as any).siteSetting.upsert({
          where: { key },
          update: { value: valStr, category },
          create: { key, value: valStr, category }
        });
      } else {
        await prisma.companyContent.upsert({
          where: { key },
          update: { content: valStr },
          create: { key, content: valStr }
        });
      }
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving site settings:", error);
    return { error: "Failed to save settings." };
  }
}
