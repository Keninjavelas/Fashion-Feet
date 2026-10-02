import { NextRequest, NextResponse } from 'next/server';

/**
 * Nonce-based Content-Security-Pipeline foundation.
 *
 * Role: Proxy runs BEFORE each app-document request, generates a per-request
 * cryptographic nonce, and emits a Content-Security-Policy header that
 * references that nonce. Next.js automatically attaches the extracted nonce
 * to framework-injected scripts (React runtime, Next.js runtime, page bundles,
 * inline styles) — see docs/01-app/02-guides/content-security-policy.md §
 * "How nonces work in Next.js".
 *
 * This is the FOUNDATION pipeline only. The directives below deliberately
 * keep `'strict-dynamic' + https:` on script-src so that scripts the
 * framework loads dynamically are not blocked, and keep `'unsafe-inline'`
 * for style-src in development (Tailwind + RSC inline styles) so the site
 * continues to render during local work. A fully locked-down policy with a
 * style nonce + SRI + no-strict-dynamic is a follow-up rollout documented in
 * docs/SecurityHardening.md § Security Hardening #12.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  const uploadsCsp =
    "default-src 'none'; style-src 'unsafe-inline'; sandbox";

  const { pathname } = request.nextUrl;
  const isUpload = pathname.startsWith('/uploads/');

  const cspHeader = isUpload
    ? uploadsCsp
    : [
        // directives we already ship statically in next.config.ts — kept here
        // so a single response header wins vs the static merge
        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        // script-src: nonce foundation.
        //   - 'unsafe-inline' is intentionally kept before the nonce token so
        //     legacy browsers that do not understand nonce keep working;
        //     modern CSP Level 2+ browsers discard 'unsafe-inline' when a
        //     nonce is present.
        //   - 'strict-dynamic' + https: trusts scripts loaded by a
        //     nonce-bearing script, so Next.js dynamic imports, server actions
        //     and chunk loading keep functioning without listing each host.
        //   - 'unsafe-eval' in development: React restores server-side error
        //     stacks via eval() only when NODE_ENV === development.
        `script-src 'unsafe-inline' 'nonce-${nonce}' 'strict-dynamic' https:${
          isDev ? " 'unsafe-eval'" : ''
        }`,
        // style-src: keep 'unsafe-inline' enabled (no nonce) for this
        // foundation rollout. Tailwind + CSS-in-JS + RSC style tags all rely
        // on inline style today; restricting this is a separate rollout.
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data:",
        "font-src 'self' data:",
        // connnect-src: NextAuth, Judy chat, any future form POSTs. Keep
        // permissive for foundation; restrict when known hosts enumerated.
        "connect-src 'self' https: wss:",
        "manifest-src 'self'",
        "worker-src 'self' blob:",
        'upgrade-insecure-requests',
      ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Nonce-Count', '1');
  return response;
}

/**
 * Matcher — run the proxy on page-document requests only, exactly as the
 * Next.js CSP guide recommends. Static assets, prefetches, the image
 * optimizer, favicon and API routes all skip nonce generation.
 */
export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|placeholders).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};

/**
 * How to consume the nonce in a Server Component / Server Action handler:
 *
 *   import { headers } from 'next/headers';
 *   const nonce = (await headers()).get('x-nonce');
 *   // Pass to <Script nonce={nonce} /> or to manual <script nonce={nonce}>.
 *
 * Next.js already applies the x-nonce from the request headers to all
 * framework-injected `<script>` and `<style>` tags automatically, so
 * `src/app/layout.tsx` does not need to manually re-pass the nonce unless
 * a third-party `<Script>` component is added (Google Analytics, Stripe,
 * reCAPTCHA, etc.).
 */
