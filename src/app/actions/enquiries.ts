"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";
import { safeRevalidatePath } from "@/lib/revalidate";
import { checkRateLimit } from "@/lib/rateLimit";

export async function createEnquiry(formData: FormData) {
  try {
    // Bot honeypot check: If the hidden honeypot field is filled, silently discard
    const honeypot = (formData.get("website_hp") as string || "").trim();
    if (honeypot) {
      return { success: true, enquiryId: "discarded_bot" };
    }

    const name = (formData.get("name") as string || "").trim();
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const phone = (formData.get("phone") as string || "").trim() || null;
    const size = (formData.get("size") as string || "").trim() || null;
    const color = (formData.get("color") as string || "").trim() || null;
    const message = (formData.get("message") as string || "").trim() || null;
    const productId = (formData.get("productId") as string || "").trim() || null;
    const productSku = (formData.get("productSku") as string || "").trim() || null;
    const enquiryType = (formData.get("enquiryType") as string || "GENERAL").trim();

    if (!name || !email) {
      return { error: "Name and Email are required fields." };
    }

    // Rate limiting: Maximum 5 enquiries per 10 minutes per email
    const limit = checkRateLimit(`enquiry_${email}`, { maxAttempts: 5, windowMs: 10 * 60 * 1000, lockoutMs: 15 * 60 * 1000 });
    if (!limit.allowed) {
      return { error: `Too many fitting requests. Please try again in ${limit.retryAfterSeconds} seconds.` };
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        email,
        phone,
        size,
        color,
        message,
        productId,
        productSku,
        enquiryType,
        status: "NEW",
      },
    });

    safeRevalidatePath("/admin/enquiries");
    return { success: true, enquiryId: enquiry.id };
  } catch (error: any) {
    console.error("Error submitting enquiry:", error);
    return { error: "Failed to submit enquiry. Please try again later." };
  }
}

export async function updateEnquiryStatusAction(enquiryId: string, status: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const updated = await prisma.enquiry.update({
      where: { id: enquiryId },
      data: { status },
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "ENQUIRY_STATUS_CHANGED",
      resourceType: "Enquiry",
      resourceId: enquiryId,
      metadata: { newStatus: status }
    });

    safeRevalidatePath("/admin/enquiries");
    return { success: true, enquiry: updated };
  } catch (error) {
    return { error: "Failed to update enquiry status." };
  }
}

export async function assignEnquiryAction(enquiryId: string, assignedAdminId: string | null) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const updated = await prisma.enquiry.update({
      where: { id: enquiryId },
      data: { assignedAdminId },
      include: { assignedAdmin: true }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "ENQUIRY_ASSIGNED",
      resourceType: "Enquiry",
      resourceId: enquiryId,
      metadata: { assignedAdminId }
    });

    safeRevalidatePath("/admin/enquiries");
    return { success: true, enquiry: updated };
  } catch (error) {
    return { error: "Failed to assign enquiry." };
  }
}

export async function addEnquiryNoteAction(enquiryId: string, noteText: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  try {
    const existing = await prisma.enquiry.findUnique({ where: { id: enquiryId } });
    if (!existing) return { error: "Enquiry not found." };

    let notesList: any[] = [];
    if (existing.internalNotes) {
      try { notesList = JSON.parse(existing.internalNotes); } catch { notesList = []; }
    }

    const newNote = {
      id: "note_" + Date.now(),
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
      authorName: admin.name,
      authorEmail: admin.email,
    };

    notesList.push(newNote);

    const updated = await prisma.enquiry.update({
      where: { id: enquiryId },
      data: { internalNotes: JSON.stringify(notesList) }
    });

    await logAdminAudit({
      adminId: admin.id,
      action: "ENQUIRY_NOTE_ADDED",
      resourceType: "Enquiry",
      resourceId: enquiryId,
      metadata: { noteId: newNote.id }
    });

    safeRevalidatePath("/admin/enquiries");
    return { success: true, enquiry: updated };
  } catch (error) {
    return { error: "Failed to add internal note." };
  }
}
