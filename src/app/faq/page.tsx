import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { FaqClient } from "./FaqClient";

export const metadata = {
  title: "Frequently Asked Questions | Fashion Feet",
  description: "Find answers to common questions about Fashion Feet handcrafted Punjabi Juttis."
};

export default function FAQPage() {
  return (
    <StorefrontLayout>
      <FaqClient />
    </StorefrontLayout>
  );
}
