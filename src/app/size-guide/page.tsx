import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { SizeGuideClient } from "./SizeGuideClient";

export const metadata = {
  title: "Size Guide | Fashion Feet",
  description: "Find your perfect handcrafted Punjabi Jutti size."
};

export default function SizeGuidePage() {
  return (
    <StorefrontLayout>
      <SizeGuideClient />
    </StorefrontLayout>
  );
}
