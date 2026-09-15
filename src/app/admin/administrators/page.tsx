import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { AdminUserTable } from "@/components/admin/AdminUserTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Administrators | Fashion Feet Admin",
};

export default async function AdminUsersPage() {
  const currentAdmin = await getAuthenticatedAdmin();

  if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" }
  }).catch(() => []);

  return (
    <AdminShell>
      <AdminUserTable initialAdmins={admins} />
    </AdminShell>
  );
}
