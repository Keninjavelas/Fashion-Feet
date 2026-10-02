"use client";

import { useEffect, useState, useTransition } from "react";
import { Mail, Clock } from "lucide-react";
import { createEnquiry } from "@/app/actions/enquiries";

/**
 * Contact form client.
 *
 * Submits directly through the `createEnquiry` server action (see
 * src/app/actions/enquiries.ts) which writes a row to the `Enquiry` table,
 * applies per-email rate limiting (5 / 10 min), a bot honeypot, and
 * revalidates the admin enquiries dashboard.
 *
 * Mobile handoff support: the mobile Contact tab redirects a customer to
 * /contact?name=...&email=...&message=... with URL query params. When those
 * are present we pre-fill the form on mount so the customer can confirm in
 * one tap instead of retyping.
 */
export function ContactClient() {
  const [reason, setReason] = useState("General Inquiry");
  const [isSubmitting, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [productSku, setProductSku] = useState("");
  const [message, setMessage] = useState("");

  // Mobile handoff URL query prefill.
  useEffect(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      const qName = search.get("name");
      const qEmail = search.get("email");
      const qMessage = search.get("message");
      if (qName) setName(qName);
      if (qEmail) setEmail(qEmail);
      if (qMessage) {
        setMessage(qMessage);
        if (!subject) setSubject("Catalogue App Enquiry");
      }
    } catch {
      /* window not available during SSR — this runs only on the client. */
    }
  }, [subject]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("enquiryType", reason.toUpperCase().replace(/\s+/g, "_"));
    startTransition(async () => {
      const result = await createEnquiry(formData);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      setIsSuccess(true);
      form.reset();
      setReason("General Inquiry");
      setProductSku("");
      setTimeout(() => setIsSuccess(false), 6000);
    });
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[var(--color-brand-50)]">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-brand-900)] tracking-tight mb-4 font-bold">We&apos;d Love to Hear From You</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have a question about our collections, sizing, or Fashion Feet? Get in touch with us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-0 rounded-3xl overflow-hidden shadow-2xl">

          {/* Contact Information */}
          <div
            aria-label="Studio contact information"
            className="lg:col-span-2 bg-[var(--color-brand-900)] text-white p-10 md:p-12 relative overflow-hidden flex flex-col justify-between"
          >
            <div aria-hidden="true" className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-[var(--color-accent-gold)]/10 rounded-full blur-3xl"></div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-10 text-[var(--color-accent-gold)]">Contact Information</h2>

              <div className="space-y-8 relative z-10">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-[var(--color-accent-gold)] flex-shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-1">Enquiries</p>
                    <p className="text-base font-medium">Use the form on this page</p>
                  </div>
                </div>

                {/* The phone row that used to sit here was removed: the number was
                    fabricated, and publishing a number the business does not own sends
                    customers to a stranger. The email row likewise no longer prints a
                    @fashionfeet.com mailbox that is not ours. */}

                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-[var(--color-accent-gold)] flex-shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-1">Boutique Hours</p>
                    <p className="text-base font-medium">Not published yet</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/10 text-xs text-white/60">
              Our first physical boutiques are being prepared. Locations and opening hours will be
              published here once they are confirmed.
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white p-10 md:p-12 border border-black/5">
            <h2 className="font-serif text-2xl text-[var(--color-brand-900)] mb-8 font-bold">Send a Message</h2>

            {isSuccess ? (
              <div
                role="status"
                aria-live="polite"
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center"
              >
                <h3 className="font-serif text-xl mb-2 font-bold">Message Sent Successfully!</h3>
                <p className="text-xs">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                {formError ? (
                  <div
                    role="alert"
                    className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-sm"
                  >
                    {formError}
                  </div>
                ) : null}

                {/* Bot honeypot — invisible to real humans, auto-filled by scrapers. */}
                <div className="absolute -left-[9999px] top-auto w-[1px] h-[1px] overflow-hidden" aria-hidden="true">
                  <label htmlFor="website_hp">Do not fill this field</label>
                  <input
                    id="website_hp"
                    name="website_hp"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact_name" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Name <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact_name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="w-full border border-black/15 p-3 text-black rounded-xl focus:outline-none focus:border-[var(--color-brand-900)] focus:ring-2 focus:ring-[var(--color-accent-gold)]/40"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact_email" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Email <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact_email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full border border-black/15 p-3 text-black rounded-xl focus:outline-none focus:border-[var(--color-brand-900)] focus:ring-2 focus:ring-[var(--color-accent-gold)]/40"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact_subject_line" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Subject (optional)
                  </label>
                  <input
                    id="contact_subject_line"
                    name="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-black/15 p-3 text-black rounded-xl focus:outline-none focus:border-[var(--color-brand-900)] focus:ring-2 focus:ring-[var(--color-accent-gold)]/40"
                    placeholder="Short subject line"
                  />
                </div>

                <div>
                  <label htmlFor="contact_reason" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Reason
                  </label>
                  <select
                    id="contact_reason"
                    name="enquiryType_label"
                    className="w-full border border-black/15 p-3 text-black rounded-xl focus:outline-none focus:border-[var(--color-brand-900)] focus:ring-2 focus:ring-[var(--color-accent-gold)]/40 appearance-none bg-white"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option>General Inquiry</option>
                    <option>Product Inquiry</option>
                    <option>Size &amp; Fit</option>
                    <option>Store Information</option>
                    <option>Feedback</option>
                    <option>Other</option>
                  </select>
                </div>

                {reason === "Product Inquiry" && (
                  <div>
                    <label htmlFor="contact_product_sku" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Product Name or Code (Optional)
                    </label>
                    <input
                      id="contact_product_sku"
                      name="productSku"
                      type="text"
                      value={productSku}
                      onChange={(e) => setProductSku(e.target.value)}
                      className="w-full border border-black/15 p-3 text-black rounded-xl focus:outline-none focus:border-[var(--color-brand-900)] focus:ring-2 focus:ring-[var(--color-accent-gold)]/40"
                      placeholder="e.g. FF-W-1042"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="contact_message" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Message <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact_message"
                    name="message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-black/15 p-3 text-black rounded-xl focus:outline-none focus:border-[var(--color-brand-900)] focus:ring-2 focus:ring-[var(--color-accent-gold)]/40 resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="w-full md:w-auto px-10 py-4 bg-[var(--color-brand-900)] text-white font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-brand-900)] transition-all rounded-xl shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
