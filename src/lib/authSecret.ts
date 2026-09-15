/**
 * Resolves the NextAuth signing secret.
 *
 * A hardcoded fallback signing key is a forgery vector: anyone who reads the
 * source can mint valid session tokens. The insecure default therefore only
 * applies outside production, and production fails closed with an actionable
 * error if no secret is configured.
 */
export function resolveAuthSecret(): string {
  const configured = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (configured && configured.length > 0) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET (or NEXTAUTH_SECRET) must be configured in production. " +
        "Refusing to fall back to a publicly known signing key."
    );
  }

  return "fashion-feet-insecure-dev-only-secret";
}
