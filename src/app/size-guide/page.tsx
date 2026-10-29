import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { SizeGuideClient } from "./SizeGuideClient";

export const metadata = {
  title: "Size Guide | Fashion Feet",
  description: "Measure your feet and ask Fashion Feet about sizing for your chosen Punjabi juttis."
};

export default function SizeGuidePage() {
  return (
    <StorefrontLayout>
      <SizeGuideClient />
    </StorefrontLayout>
  );
}
