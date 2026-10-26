"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createAdminSession, getAuthenticatedAdmin, revokeAdminSession, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";
import { generateMfaSecret, generateQrCodeUrl, buildOtpauthUrl, verifyMfaTokenWithStep, generateRecoveryCodes, verifyRecoveryCode, hashRecoveryCode } from "@/lib/mfa";
import { logAdminAudit } from "@/lib/audit";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getPreMfaAdmin, PRE_MFA_COOKIE, signPreMfaHandle } from "@/lib/preMfaAdmin";
import { createHash } from "node:crypto";

// Audit rows make throttling work across Vercel's independent function instances.
const LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

async function checkRateLimit(where: { action: string | { in: string[] }; resourceId?: string; adminId?: string }) {
  const failures = await prisma.adminAuditLog.count({
    where: { ...where, createdAt: { gte: new Date(Date.now() - LIMIT_WINDOW_MS) } },
  });
  return failures < MAX_FAILURES;
}

export async function adminLogin(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = (formData.get("password") as string || "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const emailKey = createHash("sha256").update(email).digest("hex");
  if (!(await checkRateLimit({ action: "ADMIN_LOGIN_FAILED", resourceId: emailKey }))) {
    return { error: "Too many failed attempts. Try again in 15 minutes." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const isPasswordValid = admin ? await verifyPassword(password, admin.passwordHash) : false;
  if (!admin || !isPasswordValid) {
    await logAdminAudit({ action: "ADMIN_LOGIN_FAILED", resourceType: "AdminUser", resourceId: emailKey });
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

  // No admin identifier is returned: the signed pre-MFA cookie is the only
  // handle the client needs, and echoing internal ids is unnecessary.
  return {
    success: true,
    mfaRequired: true,
    mfaEnabled: admin.mfaEnabled,
  };
}

export async function setupMfaSecret() {
  const admin = await getPreMfaAdmin();
  if (!admin) return { error: "Unauthorized pre-MFA session." };

  // Enrollment must be impossible once MFA is already active. Without this
  // guard, a caller holding only the password could invoke this action to
  // replace the enrolled secret, read the replacement from the response, derive
  // a valid code from it and obtain a full session — defeating the second factor
  // entirely. Recovery from a lost device is a Super Admin `resetAdminMfa`
  // action instead.
  if (admin.mfaEnabled) {
    await logAdminAudit({
      adminId: admin.id,
      action: "MFA_ENROLLMENT_BLOCKED_ALREADY_ENROLLED",
      resourceType: "AdminUser"
    });
    return {
      error: "MFA is already enrolled for this account. Ask a Super Admin to reset MFA if you have lost your authenticator device."
    };
  }

  // Reuse a pending secret so reloading the enrolment page cannot invalidate a
  // QR code the administrator has already scanned.
  let secret = admin.mfaSecret;
  if (!secret) {
    secret = generateMfaSecret(admin.email).secret;
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { mfaSecret: secret }
    });
    await logAdminAudit({
      adminId: admin.id,
      action: "MFA_ENROLLMENT_STARTED",
      resourceType: "AdminUser"
    });
  }

  const qrCodeUrl = await generateQrCodeUrl(buildOtpauthUrl(secret, admin.email));

  return { secret, qrCodeUrl };
}

export async function verifyAdminMfa(code: string, isRecoveryCode: boolean = false) {
  const admin = await getPreMfaAdmin();
  if (!admin) return { error: "Unauthorized or expired login session." };

  if (!(await checkRateLimit({ action: { in: ["MFA_VERIFICATION_FAILED", "MFA_CODE_REPLAY_REJECTED"] }, adminId: admin.id }))) {
    return { error: "Too many invalid MFA attempts. Try again in 15 minutes." };
  }

  let verified = false;
  let usedRecoveryCodeId: string | null = null;
  let matchedTimeStep: number | null = null;

  if (isRecoveryCode) {
    const candidateCodes = await prisma.adminRecoveryCode.findMany({
      where: { adminId: admin.id, used: false }
    });

    let rehashCandidateId: string | null = null;

    for (const candidate of candidateCodes) {
      const result = await verifyRecoveryCode(code, candidate.codeHash);
      if (result.valid) {
        verified = true;
        usedRecoveryCodeId = candidate.id;
        if (result.needsRehash) {
          rehashCandidateId = candidate.id;
        }
        break;
      }
    }

    if (verified && rehashCandidateId !== null) {
      const upgradedHash = await hashRecoveryCode(code);
      await prisma.adminRecoveryCode.update({
        where: { id: rehashCandidateId },
        data: { codeHash: upgradedHash }
      }).catch(() => null);
    }
  } else {
    if (!admin.mfaSecret) return { error: "MFA secret not initialized." };
    const evaluation = verifyMfaTokenWithStep(code, admin.mfaSecret);
    verified = evaluation.valid;
    matchedTimeStep = evaluation.timeStep;
  }

  // RFC 6238 replay protection: a time step that has already authenticated this
  // account cannot be accepted again. This is deliberately strict — it also
  // rejects reuse within the same 30s window, so an administrator who signs out
  // and immediately back in must wait for the authenticator to roll over.
  if (verified && matchedTimeStep !== null && admin.mfaLastUsedStep !== null && matchedTimeStep <= admin.mfaLastUsedStep) {
    await logAdminAudit({ adminId: admin.id, action: "MFA_CODE_REPLAY_REJECTED", resourceType: "AdminUser" });
    return { error: "Invalid authentication code. Please check your authenticator app." };
  }

  if (!verified) {
    await logAdminAudit({ adminId: admin.id, action: "MFA_VERIFICATION_FAILED", resourceType: "AdminUser" });
    return { error: "Invalid authentication code. Please check your authenticator app." };
  }


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
      const generated = await generateRecoveryCodes(8);
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

  // Record the consumed time step before issuing the session so the same code
  // cannot be replayed even if the session write failed.
  if (matchedTimeStep !== null) {
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { mfaLastUsedStep: matchedTimeStep }
    });
  }

  // Clear pre-MFA cookie and issue full admin session
  const cookieStore = await cookies();
  cookieStore.delete(PRE_MFA_COOKIE);
  await createAdminSession(admin.id);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() }
  }).catch(() => null);

  await logAdminAudit({ adminId: admin.id, action: "ADMIN_LOGIN_SUCCESS", resourceType: "AdminUser" });

  // Deliberately no revalidatePath("/admin") here. Revalidating re-renders the
  // *current* route (/admin/mfa), whose server component redirects to the login
  // page once the pre-MFA cookie has just been cleared — which destroyed the
  // one-time recovery-code display before the administrator could read or save
  // it. /admin is a dynamic route, so it renders from fresh data regardless.
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

export async function changeAdminPassword(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin || !admin.mfaEnabled) return { error: "Your admin session has expired. Sign in again." };

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || typeof confirmPassword !== "string") {
    return { error: "Complete all password fields." };
  }
  if (newPassword.length < 16 || newPassword.length > 128 || newPassword !== newPassword.trim()) {
    return { error: "Use 16 to 128 characters without spaces at the beginning or end." };
  }
  if (newPassword !== confirmPassword) return { error: "New passwords do not match." };

  if (!(await checkRateLimit({ action: "ADMIN_PASSWORD_CHANGE_FAILED", adminId: admin.id }))) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }

  const account = await prisma.adminUser.findUnique({
    where: { id: admin.id },
    select: { passwordHash: true },
  });
  if (!account) return { error: "Your admin session has expired. Sign in again." };

  if (!(await verifyPassword(currentPassword, account.passwordHash))) {
    await logAdminAudit({ adminId: admin.id, action: "ADMIN_PASSWORD_CHANGE_FAILED", resourceType: "AdminUser" });
    return { error: "Current password is incorrect." };
  }
  if (await verifyPassword(newPassword, account.passwordHash)) {
    return { error: "Choose a new password different from the current one." };
  }

  const newHash = await hashPassword(newPassword);
  const changed = await prisma.$transaction(async (tx) => {
    const updated = await tx.adminUser.updateMany({
      where: { id: admin.id, passwordHash: account.passwordHash },
      data: { passwordHash: newHash },
    });
    if (updated.count !== 1) return false;
    await tx.adminSession.deleteMany({ where: { adminId: admin.id } });
    return true;
  });

  if (!changed) return { error: "Your password changed in another session. Sign in again." };

  await logAdminAudit({ adminId: admin.id, action: "ADMIN_PASSWORD_CHANGED", resourceType: "AdminUser" });
  (await cookies()).delete(ADMIN_COOKIE_NAME);
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

export async function revokeSessionAction(sessionId: string) {
  const currentAdmin = await getAuthenticatedAdmin();
  if (!currentAdmin) return { error: "Unauthorized." };

  const target = await prisma.adminSession.findUnique({ where: { id: sessionId } });
  if (!target) return { error: "Session not found." };

  // An administrator may only revoke their own session. Revoking another
  // administrator's session (including a Super Admin's) requires Super Admin,
  // otherwise any admin could force-logout a higher-privileged account.
  if (target.adminId !== currentAdmin.id && currentAdmin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Super Admin role required to revoke another administrator's session." };
  }

  const currentToken = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (currentToken === target.token) {
    await revokeAdminSession(target.token);
  } else {
    await prisma.adminSession.delete({ where: { id: target.id } });
  }

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
