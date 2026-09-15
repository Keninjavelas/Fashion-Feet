// src/app/admin/audit-log/page.tsx
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { redirect } from "next/navigation";
import { AuditTimeline } from "@/components/admin/AuditTimeline";

export const metadata = {
  title: "Audit Timeline | Fashion Feet Admin",
};

export default async function AdminAuditLogPage() {
  const currentAdmin = await getAuthenticatedAdmin();

  if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  return (
    <AdminShell>
      <AuditTimeline />
    </AdminShell>
  );
}
