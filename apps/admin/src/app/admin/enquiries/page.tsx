import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { EnquiriesInboxClient } from "@/components/admin/EnquiriesInboxClient";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Customer Enquiries Inbox | Fashion Feet Admin",
};

export default async function AdminEnquiriesPage() {
  if (!(await getAuthenticatedAdmin())) redirect("/admin/login");

  const [enquiries, adminUsers] = await Promise.all([
    prisma.enquiry.findMany({
      include: {
        product: { select: { id: true, title: true, price: true, category: true } },
        assignedAdmin: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    }).catch(() => []),
    prisma.adminUser.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" }
    }).catch(() => [])
  ]);

  return (
    <AdminShell>
      <EnquiriesInboxClient
        initialEnquiries={enquiries as any}
        adminUsers={adminUsers}
      />
    </AdminShell>
  );
}
