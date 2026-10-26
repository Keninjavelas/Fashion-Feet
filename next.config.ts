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
    // Structural Content-Security-Policy directives that are safe to emit on
    // every response (API routes, static files, placeholders, image routes).
    // These harden framing, object embedding, base-tag hijacking and cross-
    // origin form targets without affecting the script-style loading graph.
    //
    // Page-document HTML responses (i.e. the browser top-level /__document__
    // render) receive a SUPERSSET of this policy generated dynamically by
    // src/app/proxy.ts: a per-request cryptographic nonce is generated, and
    // the nonce is referenced in a `script-src 'nonce-<value>' 'strict-dynamic'
    // https:` directive that supersedes the structural CSP header below — a
    // single Content-Security-Policy header is emitted on those responses.
    //
    // See src/app/proxy.ts + docs/SecurityHardening.md §12.
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
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/uploads/**" },
      ...(process.env.NODE_ENV === "development"
        ? [{ protocol: "http" as const, hostname: "localhost", port: "3000", pathname: "/uploads/**" }]
        : []),
    ],
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
