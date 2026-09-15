import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { hashPassword, verifyPassword as verifyPasswordHelper } from "@/lib/password";

export const ADMIN_COOKIE_NAME = "ff_admin_session";
const SESSION_EXPIRY_HOURS = 12;

export { hashPassword };

/**
 * Verifies a password against an Argon2id hash with safe legacy fallback check.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const result = await verifyPasswordHelper(password, storedHash);
  return result.valid;
}

export async function createAdminSession(adminId: string, reqDetails?: { ip?: string; userAgent?: string }) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  const session = await prisma.adminSession.create({
    data: {
      adminId,
      token,
      ipAddress: reqDetails?.ip || null,
      userAgent: reqDetails?.userAgent || null,
      expiresAt,
    }
  });

  // Set HTTP-only secure cookie
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    // Scoped to the whole app origin: a narrower "/admin" path prevented the
    // browser from ever sending this cookie to the admin API routes
    // (/api/admin/audit, /api/upload), making them permanently unreachable.
    // In the separated production topology the admin host scopes this cookie
    // naturally — see docs/SecurityHardening.md.
    path: "/",
  });

  // Update last login timestamp
  await prisma.adminUser.update({
    where: { id: adminId },
    data: { lastLoginAt: new Date() }
  });

  return session;
}

export async function getAuthenticatedAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await prisma.adminSession.findUnique({
      where: { token },
      include: { admin: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    if (session.admin.suspended) {
      return null;
    }

    // Touch session activity
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() }
    }).catch(() => null);

    return session.admin;
  } catch (err) {
    return null;
  }
}

export async function revokeAdminSession(token: string) {
  try {
    await prisma.adminSession.delete({ where: { token } }).catch(() => null);
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
  } catch (err) {
    console.error("revokeAdminSession error:", err);
  }
}
