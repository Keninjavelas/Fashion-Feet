import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { getSystemHealthMetrics } from "@/app/actions/systemHealth";
import { listBackupsAction } from "@/app/actions/backup";
import { AdminShell } from "@/components/admin/AdminShell";
import { SystemHealthClient } from "@/components/admin/SystemHealthClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "System Health & Disaster Recovery | Fashion Feet Admin",
};

export default async function AdminSystemHealthPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect("/admin/login");
  if (admin.role !== "SUPER_ADMIN") redirect("/admin");

  const [healthRes, backupsRes] = await Promise.all([
    getSystemHealthMetrics(),
    listBackupsAction()
  ]);

  return (
    <AdminShell>
      <SystemHealthClient
        initialMetrics={healthRes.success ? (healthRes as any) : null}
        initialBackups={backupsRes.success ? (backupsRes.backups as any[]) : []}
        adminRole={admin.role}
        adminName={admin.name}
        managedPostgres={/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || "")}
      />
    </AdminShell>
  );
}
