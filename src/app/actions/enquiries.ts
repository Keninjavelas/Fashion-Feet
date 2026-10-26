"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";
import { safeRevalidatePath } from "@/lib/revalidate";

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
