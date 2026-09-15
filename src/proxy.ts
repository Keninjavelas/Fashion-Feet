import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

export const { auth } = NextAuth(authConfig);

const ALLOWED_ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "PRODUCT_MANAGER",
  "CONTENT_MANAGER",
  "MARKETING_MANAGER",
  "SUPPORT_STAFF"
];

export default auth((req) => {
  const adminSessionCookie = req.cookies.get("ff_admin_session")?.value;
  const isLoggedIn = !!req.auth || !!adminSessionCookie;
  const role = (req.auth?.user?.role || (adminSessionCookie ? "SUPER_ADMIN" : "")).toUpperCase();
  const isAuthorizedAdmin = ALLOWED_ADMIN_ROLES.includes(role) || !!adminSessionCookie;

  const pathname = req.nextUrl.pathname;
  const isOnAdminLoginPage = pathname === "/admin/login";
  const isOnAdminRoute = pathname.startsWith("/admin");

  if (isOnAdminRoute && !isOnAdminLoginPage) {
    // 1. Unauthenticated -> Redirect to /admin/login
    if (!isLoggedIn) {
      const loginUrl = new URL("/admin/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return Response.redirect(loginUrl);
    }

    // 2. Logged in as non-admin customer -> Redirect to /unauthorized or /admin/login
    if (!isAuthorizedAdmin) {
      return Response.redirect(new URL("/unauthorized", req.nextUrl));
    }

    // 3. If logged in via standalone admin session, server components perform full DB session + MFA verification
    if (adminSessionCookie) {
      return NextResponse.next();
    }

    // 4. MFA Verification Check for NextAuth admin sessions
    const mfaVerifiedCookie = req.cookies.get("ff_admin_mfa_verified")?.value;
    const mfaTrustedCookie = req.cookies.get("ff_admin_mfa_trusted")?.value;
    const isMfaVerified = !!mfaVerifiedCookie || !!mfaTrustedCookie;

    if (!isMfaVerified) {
      const mfaUrl = new URL("/admin/login", req.nextUrl);
      mfaUrl.searchParams.set("mfaRequired", "true");
      mfaUrl.searchParams.set("email", req.auth?.user?.email || "");
      return Response.redirect(mfaUrl);
    }
  }

  // If already logged in & MFA verified as authorized admin navigating to /admin/login -> Redirect to /admin
  if (isOnAdminLoginPage && isLoggedIn && isAuthorizedAdmin) {
    const mfaVerifiedCookie = req.cookies.get("ff_admin_mfa_verified")?.value;
    const mfaTrustedCookie = req.cookies.get("ff_admin_mfa_trusted")?.value;
    if (mfaVerifiedCookie || mfaTrustedCookie) {
      return Response.redirect(new URL("/admin", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"]
};
