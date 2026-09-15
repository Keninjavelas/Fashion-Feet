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
    // Only non-sensitive fields. These rows are handed to a "use client" table,
    // so an unfiltered findMany serialised passwordHash and mfaSecret into the
    // browser payload even though the table never renders them.
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mfaEnabled: true,
      suspended: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: "desc" }
  }).catch(() => []);

  return (
    <AdminShell>
      <AdminUserTable initialAdmins={admins} />
    </AdminShell>
  );
}
