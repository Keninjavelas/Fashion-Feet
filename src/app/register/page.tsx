import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { RegisterClient } from "./RegisterClient";

export const metadata = {
  title: "Create Account | Fashion Feet",
  description: "Create a new Fashion Feet customer account."
};

export default function RegisterPage() {
  return (
    <StorefrontLayout>
      <RegisterClient />
    </StorefrontLayout>
  );
}
