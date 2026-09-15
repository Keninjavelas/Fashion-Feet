import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { ContactClient } from "./ContactClient";

export const metadata = {
  title: "Contact Us | Fashion Feet",
  description: "Get in touch with Fashion Feet customer support."
};

export default function ContactPage() {
  return (
    <StorefrontLayout>
      <ContactClient />
    </StorefrontLayout>
  );
}
