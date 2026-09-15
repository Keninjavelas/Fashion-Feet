import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    // Clickjacking protection. Complements the CSP frame-ancestors directive
    // below for browsers that predate CSP Level 2.
    key: "X-Frame-Options",
    value: "DENY"
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  },
  {
    // Baseline CSP. These directives deliberately do not restrict script/style
    // loading, so they harden framing, object embedding, base-tag hijacking and
    // cross-origin form targets without breaking the Next.js runtime. A
    // nonce-based script-src policy requires build-time plumbing and remains a
    // deployment-time task — see docs/SecurityHardening.md.
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none"
  }
];

// Uploaded media is served from the application origin. SVG uploads can carry
// script, so a strict per-response policy is applied to that directory to stop
// an uploaded file executing as same-origin content when opened directly.
const uploadHeaders = [
  {
    key: "Content-Security-Policy",
    value: "default-src 'none'; style-src 'unsafe-inline'; sandbox"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  }
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "better-sqlite3", "@prisma/adapter-better-sqlite3", "argon2"],
  images: {
    // Storefront imagery is served exclusively from the local media library
    // (/uploads and /placeholders). No third-party image host is permitted, so
    // a stock-photo hotlink cannot be rendered even if one were reintroduced.
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/uploads/:path*",
        headers: uploadHeaders,
      },
    ];
  },
}

export default nextConfig;
