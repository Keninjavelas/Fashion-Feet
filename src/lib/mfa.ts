import QRCode from "qrcode";
import crypto from "crypto";

// Base32 alphabet for TOTP secrets
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(input: string): Buffer {
  const cleanInput = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanInput.length; i++) {
    const idx = BASE32_CHARS.indexOf(cleanInput[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export const MFA_ISSUER = "Fashion Feet Admin";

/**
 * Builds an RFC 6238 / Key-URI-Format compatible enrolment URI.
 * The `issuer:account` label plus the `issuer` parameter is what allows Google
 * Authenticator, Microsoft Authenticator, Authy and 1Password to group and name
 * the entry correctly.
 */
export function buildOtpauthUrl(secret: string, email: string): string {
  const issuer = encodeURIComponent(MFA_ISSUER);
  const account = encodeURIComponent(email);
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

export function generateMfaSecret(email: string) {
  const secretBuffer = crypto.randomBytes(20);
  const secret = base32Encode(secretBuffer);
  return { secret, otpauthUrl: buildOtpauthUrl(secret, email) };
}

export async function generateQrCodeUrl(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (err) {
    console.error("QR Code generation error:", err);
    throw new Error("Failed to generate QR Code.");
  }
}

export function generateTotpCode(secret: string, timeStep: number = Math.floor(Date.now() / 1000 / 30)): string {
  const key = base32Decode(secret);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeUInt32BE(0, 0);
  timeBuffer.writeUInt32BE(timeStep, 4);

  const hmac = crypto.createHmac("sha1", key).update(timeBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, "0");
  return otp;
}

/**
 * Verifies a TOTP and reports which time step matched.
 *
 * The matched step is needed to reject replay: RFC 6238 requires that a code
 * which has already authenticated a login cannot be used again within its
 * validity window.
 */
export function verifyMfaTokenWithStep(
  token: string,
  secret: string
): { valid: boolean; timeStep: number | null } {
  if (!token || !secret) return { valid: false, timeStep: null };

  const cleanToken = token.trim();
  if (!/^\d{6}$/.test(cleanToken)) return { valid: false, timeStep: null };

  const currentTimeStep = Math.floor(Date.now() / 1000 / 30);

  // Current time step plus a +/- 1 step window for clock drift tolerance.
  for (let window = -1; window <= 1; window++) {
    const timeStep = currentTimeStep + window;
    const expected = generateTotpCode(secret, timeStep);
    if (
      expected.length === cleanToken.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(cleanToken))
    ) {
      return { valid: true, timeStep };
    }
  }

  return { valid: false, timeStep: null };
}

export function verifyMfaToken(token: string, secret: string): boolean {
  return verifyMfaTokenWithStep(token, secret).valid;
}

export function generateRecoveryCodes(count: number = 8): { rawCodes: string[]; hashedCodes: string[] } {
  const rawCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(5).toString("hex").toUpperCase(); // e.g. "A1B2C3D4E5"
    const hash = hashRecoveryCode(raw);
    rawCodes.push(raw);
    hashedCodes.push(hash);
  }

  return { rawCodes, hashedCodes };
}

export function hashRecoveryCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}
