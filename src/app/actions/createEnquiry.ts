"use server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendEnquiryEmail } from "@/lib/enquiryEmail";

export async function createEnquiry(formData: FormData) {
  try {
    const honeypot = (formData.get("website_hp") as string || "").trim();
    if (honeypot) return { success: true, enquiryId: "discarded_bot" };

    const name = (formData.get("name") as string || "").trim();
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const phone = (formData.get("phone") as string || "").trim() || null;
    const size = (formData.get("size") as string || "").trim() || null;
    const color = (formData.get("color") as string || "").trim() || null;
    const message = (formData.get("message") as string || "").trim() || null;
    const subject = (formData.get("subject") as string || "").trim() || null;
    const productId = (formData.get("productId") as string || "").trim() || null;
    const productSku = (formData.get("productSku") as string || "").trim() || null;
    const enquiryType = (formData.get("enquiryType") as string || "GENERAL").trim();

    if (!name || !email || !message) return { error: "Name, email, and message are required fields." };
    if (name.length > 120 || email.length > 254 || message.length > 5_000 || (subject?.length || 0) > 200) {
      return { error: "One or more fields are too long." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };

    const limit = checkRateLimit(`enquiry_${email}`, {
      maxAttempts: 5,
      windowMs: 10 * 60 * 1000,
      lockoutMs: 15 * 60 * 1000,
    });
    if (!limit.allowed) {
      return { error: `Too many fitting requests. Please try again in ${limit.retryAfterSeconds} seconds.` };
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        name, email, phone, size, color, subject, message, productId, productSku,
        enquiryType, status: "NEW",
      },
    });

    const notificationSent = await sendEnquiryEmail(enquiry);
    return { success: true, enquiryId: enquiry.id, notificationSent };
  } catch (error) {
    console.error("Error submitting enquiry:", error);
    return { error: "Failed to submit enquiry. Please try again later." };
  }
}
