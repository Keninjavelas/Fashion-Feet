import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { StoreManagerClient } from "@/components/admin/StoreManagerClient";

export const metadata = {
  title: "Store Locations | Fashion Feet Admin",
};

export default async function AdminStoresPage() {
  const currentAdmin = await getAuthenticatedAdmin();

  const stores = await prisma.store.findMany({
    orderBy: { displayOrder: "asc" }
  }).catch(() => []);

  return (
    <AdminShell>
      <StoreManagerClient
        initialStores={stores as any}
        currentAdminRole={currentAdmin?.role || "CONTENT_MANAGER"}
      />
    </AdminShell>
  );
}
