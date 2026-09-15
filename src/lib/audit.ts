import { prisma } from "@/lib/prisma";

export interface LogAuditParams {
  adminId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAdminAudit(params: LogAuditParams) {
  try {
    const log = await prisma.adminAuditLog.create({
      data: {
        adminId: params.adminId || null,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      }
    });
    return log;
  } catch (err) {
    console.error("Failed to log admin audit entry:", err);
  }
}
