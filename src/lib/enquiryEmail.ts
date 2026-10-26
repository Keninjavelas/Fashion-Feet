import { CONTACT_EMAIL } from "@/lib/contactDetails";

type EnquiryForEmail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  enquiryType: string | null;
  productSku: string | null;
  size: string | null;
  color: string | null;
};

/** A successful return means the mail provider accepted the notification. */
export async function sendEnquiryEmail(enquiry: EnquiryForEmail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`Email notification is not configured for enquiry ${enquiry.id}.`);
    return false;
  }

  const subject = (enquiry.subject || enquiry.enquiryType || "New enquiry")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 160);
  const text = [
    "A customer submitted an enquiry through Fashion Feet.",
    `Reference: ${enquiry.id}`,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone || "Not provided"}`,
    `Reason: ${enquiry.enquiryType || "General enquiry"}`,
    `Subject: ${enquiry.subject || "Not provided"}`,
    `Product: ${enquiry.productSku || "Not specified"}`,
    `Size: ${enquiry.size || "Not specified"}`,
    `Color: ${enquiry.color || "Not specified"}`,
    "",
    "Message:",
    enquiry.message || "No message provided",
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `enquiry-${enquiry.id}`,
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Fashion Feet <enquiries@mail.fashionfeet.co.in>",
        to: [CONTACT_EMAIL],
        reply_to: enquiry.email,
        subject: `Fashion Feet: ${subject}`,
        text,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      console.error(`Email notification for enquiry ${enquiry.id} was rejected (${response.status}).`);
      return false;
    }
    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null || !("id" in data) || typeof data.id !== "string") {
      console.error(`Email notification for enquiry ${enquiry.id} returned no message ID.`);
      return false;
    }
    return true;
  } catch {
    console.error(`Email notification for enquiry ${enquiry.id} failed to reach the provider.`);
    return false;
  }
}
