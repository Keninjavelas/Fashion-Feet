// src/lib/auditSanitizer.ts
/**
 * Utility to strip sensitive fields from audit metadata before exposing it.
 */
const SENSITIVE_KEYS = [
  "password",
  "passwordhash",
  "hashedpassword",
  "token",
  "accesstoken",
  "refreshtoken",
  "sessiontoken",
  "secrettoken",
  "recoverycode",
  "recoverycodes",
  "backupcode",
  "backupcodes",
  "mfasecret",
  "otpsecret",
  "apikey",
  "secret",
  "sessionid",
  "ipaddress",
  "useragent",
  "userip",
];

/**
 * Keys are compared case-insensitively and by substring, so variants such as
 * `Password`, `mfa_secret` or `adminPasswordHash` are stripped as well.
 */
function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalized.length === 0) return false;
  return SENSITIVE_KEYS.some((sensitive) => normalized.includes(sensitive));
}

function stripSensitive(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripSensitive);
  if (obj && typeof obj === "object") {
    const cleaned: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (isSensitiveKey(k)) continue;
      cleaned[k] = stripSensitive(v);
    }
    return cleaned;
  }
  return obj;
}

export function sanitizeAuditRecord(record: any) {
  const { metadata, ...rest } = record;
  let sanitizedMeta = metadata;
  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata);
      const cleaned = stripSensitive(parsed);
      sanitizedMeta = JSON.stringify(cleaned);
    } catch {
      // Malformed metadata cannot be sanitized field-by-field, so it is
      // withheld centrally rather than exposed verbatim by any caller.
      sanitizedMeta = null;
    }
  }
  return { ...rest, metadata: sanitizedMeta };
}
