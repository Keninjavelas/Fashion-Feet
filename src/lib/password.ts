import crypto from "crypto";
import argon2 from "argon2";

/**
 * Hashes a password using Argon2id with unique salt.
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password.trim(), {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,       // 3 iterations
    parallelism: 4,
  });
}

/**
 * Verifies a password against an Argon2id hash, with automatic legacy migration support.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (!storedHash || !password) return { valid: false, needsRehash: false };

  const trimmed = password.trim();

  // 1. Primary verification: Argon2id hash ($argon2id$...)
  if (storedHash.startsWith("$argon2")) {
    try {
      const valid = await argon2.verify(storedHash, trimmed);
      return { valid, needsRehash: false };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  // 2. Legacy SHA-256 hash check
  const sha256Hash = crypto.createHash("sha256").update(trimmed).digest("hex");
  if (storedHash === sha256Hash) {
    return { valid: true, needsRehash: true };
  }

  // Any value that is not a recognised password hash fails closed. Comparing
  // the input against the stored value directly would accept plaintext
  // credentials, which defeats password hashing entirely.
  return { valid: false, needsRehash: false };
}
