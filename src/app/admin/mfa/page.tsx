import { getPreMfaAdmin } from "@/app/actions/admin";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { AdminMfaClient } from "./AdminMfaClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "MFA Verification | Fashion Feet Admin",
};

export default async function AdminMfaPage() {
  const admin = await getPreMfaAdmin();

  if (admin) {
    return <AdminMfaClient adminEmail={admin.email} mfaEnabled={admin.mfaEnabled} />;
  }

  // A Next.js server action re-renders the current route as part of its
  // response. verifyAdminMfa clears the pre-MFA handle and creates the full
  // session in the same request, so that re-render found no pre-MFA admin and
  // redirected to the login page — destroying the one-time recovery-code display
  // before the administrator could read it. Rendering the page for an
  // already-authenticated admin keeps that component mounted. The actions remain
  // inert here because both require a pre-MFA handle.
  const authenticated = await getAuthenticatedAdmin();
  if (authenticated) {
    return <AdminMfaClient adminEmail={authenticated.email} mfaEnabled={true} />;
  }

  redirect("/admin/login");
}
