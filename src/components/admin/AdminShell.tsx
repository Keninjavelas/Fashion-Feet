import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
import { redirect } from "next/navigation";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <AdminWorkspace adminName={admin.name} adminEmail={admin.email} role={admin.role} mfaEnabled={admin.mfaEnabled}>
      {children}
    </AdminWorkspace>
  );
}
