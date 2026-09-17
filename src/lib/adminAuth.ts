import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { hashPassword, verifyPassword as verifyPasswordHelper } from "@/lib/password";

export const ADMIN_COOKIE_NAME = "ff_admin_session";
const SESSION_EXPIRY_HOURS = 12;

/**
 * Admin sessions carry two independent bounds.
 *
 * `SESSION_EXPIRY_HOURS` is the absolute ceiling: a session dies 12 hours after
 * it was issued no matter how heavily it was used. On its own that is too
 * generous for an unattended machine — an admin console left open in a back
 * office stayed usable for the remainder of the working day.
 *
 * `ADMIN_IDLE_TIMEOUT_MINUTES` adds an inactivity bound on top. A session that
 * has not been used for that long is dropped even though its absolute expiry has
 * not passed, which is what actually closes the "someone walks up to the
 * unlocked laptop" gap.
 *
 * The value is configurable because the right number depends on the operating
 * environment, but it is deliberately not *disable-able*: an unset, non-numeric
 * or non-positive value falls back to the default rather than switching the check
 * off. A timeout that can be silently turned off tends to end up off.
 */
const DEFAULT_IDLE_TIMEOUT_MINUTES = 30;

function resolveIdleTimeoutMs(): number {
  const configured = Number(process.env.ADMIN_IDLE_TIMEOUT_MINUTES);
  const minutes =
    Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_IDLE_TIMEOUT_MINUTES;
  return minutes * 60 * 1000;
}

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
      // Only the fields callers need. Returning the whole AdminUser row from the
      // shared auth helper would carry passwordHash and mfaSecret along with it,
      // where any future client-component prop would serialise them to the
      // browser. The login path needs passwordHash, and it queries directly.
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            mfaEnabled: true,
            suspended: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    if (session.admin.suspended) {
      return null;
    }

    // Inactivity bound — see the two-tier note on DEFAULT_IDLE_TIMEOUT_MINUTES.
    // The row is deleted rather than merely refused, so a dead session does not
    // linger in the table and keep appearing in the admin's active-sessions view
    // as though it were still usable. `lastActiveAt` is non-nullable with a DB
    // default, but fall back to `createdAt` so a row written without the client
    // cannot cause a freshly issued session to be rejected.
    const lastActiveAt = session.lastActiveAt ?? session.createdAt;
    if (Date.now() - lastActiveAt.getTime() > resolveIdleTimeoutMs()) {
      await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => null);
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
