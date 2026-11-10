"use server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export interface NewsletterResult {
  success?: boolean;
  alreadySubscribed?: boolean;
  error?: string;
}

export async function subscribeNewsletter(formData: FormData): Promise<NewsletterResult> {
  try {
    // 1. Bot Honeypot protection: discard silently if filled
    const honeypot = (formData.get("website_hp") as string || "").trim();
    if (honeypot) {
      return { success: true };
    }

    // 2. Validate email
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    if (!email) {
      return { error: "Please enter your email address." };
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: "Please enter a valid email address." };
    }

    // 3. Rate limiting per email
    const limit = checkRateLimit(`newsletter_${email}`, {
      maxAttempts: 5,
      windowMs: 10 * 60 * 1000,
      lockoutMs: 15 * 60 * 1000,
    });
    if (!limit.allowed) {
      return {
        error: `Too many attempts. Please try again in ${limit.retryAfterSeconds} seconds.`,
      };
    }

    // 4. Check if already subscribed
    const existing = await prisma.enquiry.findFirst({
      where: {
        email,
        enquiryType: "NEWSLETTER",
      },
    });

    if (existing) {
      return { success: true, alreadySubscribed: true };
    }

    // 5. Create subscriber record in the Enquiry table
    await prisma.enquiry.create({
      data: {
        name: "Newsletter Subscriber",
        email,
        subject: "Heritage Atelier Newsletter Subscription",
        message: "Customer subscribed to private previews of seasonal drops and bespoke announcements via the storefront footer.",
        enquiryType: "NEWSLETTER",
        status: "NEW",
      },
    });

    return { success: true, alreadySubscribed: false };
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return { error: "Subscription is temporarily unavailable. Please try again later." };
  }
}

