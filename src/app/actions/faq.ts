"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";

function readFaqForm(formData: FormData) {
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const category = String(formData.get("category") ?? "GENERAL").trim().toUpperCase() || "GENERAL";
  const isPinned = formData.get("isPinned") === "true";

  if (!question || !answer) return { error: "Question and answer are required." } as const;
  if (question.length > 300 || answer.length > 5000 || category.length > 80) {
    return { error: "Question, answer, or category is too long." } as const;
  }
  return { data: { question, answer, category, isPinned } } as const;
}

export async function createFaq(formData: FormData) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const parsed = readFaqForm(formData);
    if ("error" in parsed) return { error: parsed.error };

    const count = await prisma.faq.count();

    const faq = await prisma.faq.create({
      data: {
        ...parsed.data,
        displayOrder: count
      }
    });

    await logAdminAudit({ adminId: currentAdmin.id, action: "FAQ_CREATED", resourceType: "Faq", resourceId: faq.id });

    revalidatePath("/admin/faq");
    revalidatePath("/faq");
    return { success: true, faq };
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return { error: "Failed to create FAQ." };
  }
}

export async function updateFaq(id: string, formData: FormData) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const parsed = readFaqForm(formData);
    if ("error" in parsed) return { error: parsed.error };

    const updated = await prisma.faq.update({
      where: { id },
      data: parsed.data
    });

    await logAdminAudit({ adminId: currentAdmin.id, action: "FAQ_UPDATED", resourceType: "Faq", resourceId: id });

    revalidatePath("/admin/faq");
    revalidatePath("/faq");
    return { success: true, updated };
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return { error: "Failed to update FAQ." };
  }
}

export async function togglePinFaq(id: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) return { error: "FAQ not found." };

    const updated = await prisma.faq.update({
      where: { id },
      data: { isPinned: !existing.isPinned }
    });

    await logAdminAudit({ adminId: currentAdmin.id, action: updated.isPinned ? "FAQ_PINNED" : "FAQ_UNPINNED", resourceType: "Faq", resourceId: id });

    revalidatePath("/admin/faq");
    revalidatePath("/faq");
    return { success: true, updated };
  } catch (error) {
    return { error: "Failed to toggle pin status." };
  }
}

export async function deleteFaq(id: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    await prisma.faq.delete({ where: { id } });
    await logAdminAudit({ adminId: currentAdmin.id, action: "FAQ_DELETED", resourceType: "Faq", resourceId: id });
    revalidatePath("/admin/faq");
    revalidatePath("/faq");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete FAQ." };
  }
}
