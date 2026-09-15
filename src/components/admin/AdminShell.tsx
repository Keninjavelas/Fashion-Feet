import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { redirect } from "next/navigation";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <AdminSidebar currentRole={admin.role} adminName={admin.name} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminHeader
          adminName={admin.name}
          adminEmail={admin.email}
          role={admin.role}
          mfaEnabled={admin.mfaEnabled}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
