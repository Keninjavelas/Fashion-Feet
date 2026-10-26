import { NextRequest, NextResponse } from "next/server";

/** Fast redirect only; every page, action, and API must validate the DB session. */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/admin/login" || pathname === "/admin/mfa") {
    return NextResponse.next();
  }

  if (request.cookies.has("ff_admin_session")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/upload"],
};
