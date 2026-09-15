"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

export async function updateCompanyContent(key: string, content: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    await prisma.companyContent.upsert({
      where: { key },
      update: { content },
      create: { key, content }
    });

    revalidatePath("/admin/pages");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/stores");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating company content:", error);
    return { error: "Failed to update page content." };
  }
}
