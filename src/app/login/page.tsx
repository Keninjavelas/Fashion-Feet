import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { LoginClient } from "./LoginClient";

export const metadata = {
  title: "Sign In | Fashion Feet",
  description: "Sign into your Fashion Feet customer account."
};

export default function LoginPage() {
  return (
    <StorefrontLayout>
      <LoginClient />
    </StorefrontLayout>
  );
}
