import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { prisma } from "@/lib/prisma";
import { FaqClient, type FaqItem } from "./FaqClient";

/**
 * The FAQ page is rendered per request from the database, exactly like
 * `GET /api/v1/faqs`. Caching this at build time would let the website and the
 * mobile app serve different answers, which is the drift this page now avoids.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Frequently Asked Questions | Fashion Feet",
  description: "Answers to common questions about Fashion Feet, our products, and how to reach us."
};

export default async function FAQPage() {
  // Same ordering as `GET /api/v1/faqs` (pinned first, then display order) so the
  // storefront and the mobile app cannot disagree. No draft/hidden column exists
  // on the `Faq` model, so every row is public.
  const faqs: FaqItem[] = await prisma.faq.findMany({
    orderBy: [{ isPinned: "desc" }, { displayOrder: "asc" }],
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
      isPinned: true,
      displayOrder: true,
    },
  });

  return (
    <StorefrontLayout>
      <FaqClient faqs={faqs} />
    </StorefrontLayout>
  );
}
