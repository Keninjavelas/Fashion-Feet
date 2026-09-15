import { getPreMfaAdmin } from "@/app/actions/admin";
import { AdminMfaClient } from "./AdminMfaClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "MFA Verification | Fashion Feet Admin",
};

export default async function AdminMfaPage() {
  const admin = await getPreMfaAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminMfaClient adminEmail={admin.email} mfaEnabled={admin.mfaEnabled} />;
}
