import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { ProfileLayoutClient } from "./ProfileLayoutClient";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <StorefrontLayout>
      <ProfileLayoutClient>{children}</ProfileLayoutClient>
    </StorefrontLayout>
  );
}
