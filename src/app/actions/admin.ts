"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createAdminSession, getAuthenticatedAdmin, revokeAdminSession, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";
import { generateMfaSecret, generateQrCodeUrl, verifyMfaToken, generateRecoveryCodes, hashRecoveryCode } from "@/lib/mfa";
import { logAdminAudit } from "@/lib/audit";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { resolveAuthSecret } from "@/lib/authSecret";

const PRE_MFA_COOKIE = "ff_admin_premfa";
const PRE_MFA_TTL_MS = 5 * 60 * 1000;

/**
 * The pre-MFA cookie carries an HMAC-signed handle rather than a bare admin id,
 * so it cannot be forged or tampered with to skip the password factor.
 */
function signPreMfaHandle(adminId: string): string {
  const issuedAt = Date.now();
  const payload = `${adminId}.${issuedAt}`;
  const signature = crypto.createHmac("sha256", resolveAuthSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function readPreMfaHandle(value: string | undefined): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [adminId, issuedAtRaw, signature] = parts;
  const issuedAt = Number(issuedAtRaw);
  if (!adminId || !Number.isFinite(issuedAt)) return null;
  if (Date.now() - issuedAt > PRE_MFA_TTL_MS) return null;

  const expected = crypto
    .createHmac("sha256", resolveAuthSecret())
    .update(`${adminId}.${issuedAt}`)
    .digest("hex");
  const provided = Buffer.from(signature, "hex");
  const computed = Buffer.from(expected, "hex");
  if (provided.length !== computed.length || !crypto.timingSafeEqual(provided, computed)) {
    return null;
  }

  return adminId;
}

// Rate-limiting in memory map for invalid login/MFA attempts
const failedAttemptsMap = new Map<string, { count: number; lockUntil: number }>();

function checkRateLimit(key: string): { allowed: boolean; remainingSeconds?: number } {
  const record = failedAttemptsMap.get(key);
  if (!record) return { allowed: true };
  if (record.lockUntil > Date.now()) {
    const remainingSeconds = Math.ceil((record.lockUntil - Date.now()) / 1000);
    return { allowed: false, remainingSeconds };
  }
  if (record.lockUntil <= Date.now()) {
    failedAttemptsMap.delete(key);
  }
  return { allowed: true };
}

function recordFailedAttempt(key: string) {
  const record = failedAttemptsMap.get(key) || { count: 0, lockUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
  }
  failedAttemptsMap.set(key, record);
}

function clearRateLimit(key: string) {
  failedAttemptsMap.delete(key);
}

export async function adminLogin(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = (formData.get("password") as string || "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const rateCheck = checkRateLimit(email);
  if (!rateCheck.allowed) {
    return { error: `Too many failed attempts. Account locked for ${rateCheck.remainingSeconds} seconds.` };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const isPasswordValid = admin ? await verifyPassword(password, admin.passwordHash) : false;
  if (!admin || !isPasswordValid) {
    recordFailedAttempt(email);
    await logAdminAudit({ action: "ADMIN_LOGIN_FAILED", resourceType: "AdminUser", metadata: { email } });
    return { error: "Invalid administrator credentials." };
  }

  if (admin.suspended) {
    await logAdminAudit({ adminId: admin.id, action: "ADMIN_LOGIN_BLOCKED_SUSPENDED", resourceType: "AdminUser" });
    return { error: "This administrator account has been suspended. Contact a Super Admin." };
  }

  // Set short-lived pre-MFA cookie
  const cookieStore = await cookies();
  cookieStore.set(PRE_MFA_COOKIE, signPreMfaHandle(admin.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300, // 5 mins
    path: "/admin",
  });

  return {
    success: true,
    mfaRequired: true,
    mfaEnabled: admin.mfaEnabled,
    adminId: admin.id,
  };
}

export async function getPreMfaAdmin() {
  try {
    const cookieStore = await cookies();
    const adminId = readPreMfaHandle(cookieStore.get(PRE_MFA_COOKIE)?.value);
    if (!adminId) return null;

    return await prisma.adminUser.findUnique({ where: { id: adminId } });
  } catch {
    return null;
  }
}

export async function setupMfaSecret() {
  const admin = await getPreMfaAdmin();
  if (!admin) return { error: "Unauthorized pre-MFA session." };

  const { secret, otpauthUrl } = generateMfaSecret(admin.email);
  const qrCodeUrl = await generateQrCodeUrl(otpauthUrl);

  // Save secret temporarily
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { mfaSecret: secret }
  });

  return { secret, qrCodeUrl };
}

export async function verifyAdminMfa(code: string, isRecoveryCode: boolean = false) {
  const admin = await getPreMfaAdmin();
  if (!admin) return { error: "Unauthorized or expired login session." };

  const rateCheck = checkRateLimit(admin.id);
  if (!rateCheck.allowed) {
    return { error: `Too many invalid MFA attempts. Locked for ${rateCheck.remainingSeconds} seconds.` };
  }

  let verified = false;
  let usedRecoveryCodeId: string | null = null;

  if (isRecoveryCode) {
    const codeHash = hashRecoveryCode(code);
    const recoveryCode = await prisma.adminRecoveryCode.findFirst({
      where: { adminId: admin.id, codeHash, used: false }
    });

    if (recoveryCode) {
      verified = true;
      usedRecoveryCodeId = recoveryCode.id;
    }
  } else {
    if (!admin.mfaSecret) return { error: "MFA secret not initialized." };
    verified = verifyMfaToken(code, admin.mfaSecret);
  }

  if (!verified) {
    recordFailedAttempt(admin.id);
    await logAdminAudit({ adminId: admin.id, action: "MFA_VERIFICATION_FAILED", resourceType: "AdminUser" });
    return { error: "Invalid authentication code. Please check your authenticator app." };
  }

  clearRateLimit(admin.id);

  let rawRecoveryCodes: string[] = [];

  // Enable MFA & generate recovery codes if first time
  if (!admin.mfaEnabled || isRecoveryCode) {
    if (usedRecoveryCodeId) {
      await prisma.adminRecoveryCode.update({
        where: { id: usedRecoveryCodeId },
        data: { used: true, usedAt: new Date() }
      });
      await logAdminAudit({ adminId: admin.id, action: "RECOVERY_CODE_USED", resourceType: "AdminRecoveryCode", resourceId: usedRecoveryCodeId });
    }

    if (!admin.mfaEnabled) {
      const generated = generateRecoveryCodes(8);
      rawRecoveryCodes = generated.rawCodes;

      await prisma.adminRecoveryCode.deleteMany({ where: { adminId: admin.id } });
      await prisma.adminRecoveryCode.createMany({
        data: generated.hashedCodes.map(hash => ({ adminId: admin.id, codeHash: hash }))
      });

      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { mfaEnabled: true }
      });

      await logAdminAudit({ adminId: admin.id, action: "MFA_ENROLLED_SUCCESS", resourceType: "AdminUser" });
    }
  }

  // Clear pre-MFA cookie and issue full admin session
  const cookieStore = await cookies();
  cookieStore.delete(PRE_MFA_COOKIE);
  await createAdminSession(admin.id);

  await logAdminAudit({ adminId: admin.id, action: "ADMIN_LOGIN_SUCCESS", resourceType: "AdminUser" });

  revalidatePath("/admin");
  return { success: true, recoveryCodes: rawRecoveryCodes };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const admin = await getAuthenticatedAdmin();

  if (token) {
    if (admin) {
      await logAdminAudit({ adminId: admin.id, action: "ADMIN_LOGOUT", resourceType: "AdminUser" });
    }
    await revokeAdminSession(token);
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function inviteAdminUser(formData: FormData) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Super Admin role required." };
  }

  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const name = (formData.get("name") as string || "").trim();
  const role = (formData.get("role") as string || "CONTENT_MANAGER");
  const tempPassword = (formData.get("password") as string || "").trim();

  if (!email || !name || !tempPassword) return { error: "Name, email, and initial password are required." };
  if (tempPassword.length < 12) {
    return { error: "Initial password must be at least 12 characters long." };
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return { error: "An administrator with this email already exists." };

  const newAdmin = await prisma.adminUser.create({
    data: {
      email,
      name,
      role: role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "CONTENT_MANAGER",
      passwordHash: await hashPassword(tempPassword),
      mfaEnabled: false,
    }
  });

  await logAdminAudit({
    adminId: currentAdmin.id,
    action: "ADMIN_INVITED",
    resourceType: "AdminUser",
    resourceId: newAdmin.id,
    metadata: { invitedEmail: email, role }
  });

  revalidatePath("/admin/administrators");
  // Never echo the stored password hash back to the client.
  return {
    success: true,
    tempPassword,
    newAdmin: {
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
    },
  };
}

export async function toggleSuspendAdmin(adminId: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Super Admin role required." };
  }

  if (currentAdmin.id === adminId) {
    return { error: "You cannot suspend your own Super Admin account." };
  }

  const target = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!target) return { error: "Administrator not found." };

  const newStatus = !target.suspended;
  await prisma.adminUser.update({
    where: { id: adminId },
    data: { suspended: newStatus }
  });

  if (newStatus) {
    // Revoke all active sessions
    await prisma.adminSession.deleteMany({ where: { adminId } });
  }

  await logAdminAudit({
    adminId: currentAdmin.id,
    action: newStatus ? "ADMIN_SUSPENDED" : "ADMIN_UNSUSPENDED",
    resourceType: "AdminUser",
    resourceId: adminId
  });

  revalidatePath("/admin/administrators");
  return { success: true };
}

export async function resetAdminMfa(adminId: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Super Admin role required." };
  }

  await prisma.adminUser.update({
    where: { id: adminId },
    data: { mfaEnabled: false, mfaSecret: null }
  });

  await prisma.adminRecoveryCode.deleteMany({ where: { adminId } });
  await prisma.adminSession.deleteMany({ where: { adminId } });

  await logAdminAudit({
    adminId: currentAdmin.id,
    action: "ADMIN_MFA_RESET",
    resourceType: "AdminUser",
    resourceId: adminId
  });

  revalidatePath("/admin/administrators");
  return { success: true };
}

export async function revokeSessionAction(token: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  const target = await prisma.adminSession.findUnique({ where: { token } });
  if (!target) return { error: "Session not found." };

  // An administrator may only revoke their own session. Revoking another
  // administrator's session (including a Super Admin's) requires Super Admin,
  // otherwise any admin could force-logout a higher-privileged account.
  if (target.adminId !== currentAdmin.id && currentAdmin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Super Admin role required to revoke another administrator's session." };
  }

  await revokeAdminSession(token);

  await logAdminAudit({
    adminId: currentAdmin.id,
    action: "ADMIN_SESSION_REVOKED",
    resourceType: "AdminSession",
    resourceId: target.id,
    metadata: { targetAdminId: target.adminId, self: target.adminId === currentAdmin.id }
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
