import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { resolveAuthSecret } from "@/lib/authSecret";

export const PRE_MFA_COOKIE = "ff_admin_premfa";
const PRE_MFA_TTL_MS = 5 * 60 * 1000;

export function signPreMfaHandle(adminId: string): string {
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

  const expected = crypto.createHmac("sha256", resolveAuthSecret())
    .update(`${adminId}.${issuedAt}`).digest("hex");
  const provided = Buffer.from(signature, "hex");
  const computed = Buffer.from(expected, "hex");
  if (provided.length !== computed.length || !crypto.timingSafeEqual(provided, computed)) return null;

  return adminId;
}

// This is a server-only helper. It must not be exported from a "use server"
// actions module: a pre-MFA caller must never receive the enrolled TOTP secret.
export async function getPreMfaAdmin() {
  const adminId = readPreMfaHandle((await cookies()).get(PRE_MFA_COOKIE)?.value);
  if (!adminId) return null;

  return prisma.adminUser.findFirst({
    where: { id: adminId, suspended: false },
    select: {
      id: true,
      email: true,
      mfaEnabled: true,
      mfaSecret: true,
      mfaLastUsedStep: true,
    },
  });
}
