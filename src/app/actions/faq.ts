"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

export async function createFaq(formData: FormData) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const category = formData.get("category") as string || "GENERAL";
    const isPinned = formData.get("isPinned") === "true";

    if (!question || !answer) return { error: "Question and Answer are required." };

    const count = await prisma.faq.count();

    const faq = await prisma.faq.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim().toUpperCase(),
        isPinned,
        displayOrder: count
      }
    });

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
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const category = formData.get("category") as string || "GENERAL";
    const isPinned = formData.get("isPinned") === "true";

    if (!question || !answer) return { error: "Question and Answer are required." };

    const updated = await prisma.faq.update({
      where: { id },
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim().toUpperCase(),
        isPinned
      }
    });

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

    await prisma.faq.update({
      where: { id },
      data: { isPinned: !existing.isPinned }
    });

    revalidatePath("/admin/faq");
    revalidatePath("/faq");
    return { success: true };
  } catch (error) {
    return { error: "Failed to toggle pin status." };
  }
}

export async function deleteFaq(id: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  try {
    await prisma.faq.delete({ where: { id } });
    revalidatePath("/admin/faq");
    revalidatePath("/faq");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete FAQ." };
  }
}
