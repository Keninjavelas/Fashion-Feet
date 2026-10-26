import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { ActiveSessionsView } from "@/components/admin/ActiveSessionsView";
import { AdminShell } from "@/components/admin/AdminShell";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Settings | Fashion Feet Admin",
};

export default async function AdminSettingsPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) redirect("/admin/login");

  const sessions = await prisma.adminSession.findMany({
    where: { adminId: admin.id },
    orderBy: { lastActiveAt: "desc" },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      lastActiveAt: true,
    },
  }).catch(() => []);

  return (
    <AdminShell>
      <ActiveSessionsView initialSessions={sessions} currentAdminEmail={admin.email} />
    </AdminShell>
  );
}
