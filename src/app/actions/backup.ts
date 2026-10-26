"use server";

import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { logAdminAudit } from "@/lib/audit";
import { createDatabaseBackup, listDatabaseBackups, restoreDatabaseBackup } from "@/lib/backup";
import { revalidatePath } from "next/cache";

export async function createBackupAction() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  if (admin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Super Admin role required to create database backups." };
  }

  try {
    const backup = await createDatabaseBackup(admin.id);

    await logAdminAudit({
      adminId: admin.id,
      action: "DATABASE_BACKUP_CREATED",
      resourceType: "SystemBackup",
      resourceId: backup.id,
      metadata: { filename: backup.filename, sizeBytes: backup.fileSizeBytes }
    });

    revalidatePath("/admin/system-health");
    revalidatePath("/admin/settings");
    return { success: true, backup };
  } catch (error: any) {
    console.error("Error creating database backup:", error);
    return { error: error.message || "Failed to create database backup." };
  }
}

export async function listBackupsAction() {
  const admin = await getAuthenticatedAdmin();
  if (!admin || admin.role !== "SUPER_ADMIN") return { error: "Unauthorized." };

  try {
    const backups = await listDatabaseBackups();
    return { success: true, backups };
  } catch (error: any) {
    return { error: "Failed to list backups." };
  }
}

export async function restoreBackupAction(backupId: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { error: "Unauthorized." };

  if (admin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Super Admin role required to restore database snapshots." };
  }

  try {
    const result = await restoreDatabaseBackup(backupId, admin.id);

    await logAdminAudit({
      adminId: admin.id,
      action: "DATABASE_RESTORED",
      resourceType: "SystemBackup",
      resourceId: backupId,
      metadata: { restoredFilename: result.restoredFilename }
    });

    revalidatePath("/");
    revalidatePath("/admin/system-health");
    return { success: true };
  } catch (error: any) {
    console.error("Error restoring database backup:", error);
    return { error: error.message || "Failed to restore database backup." };
  }
}
