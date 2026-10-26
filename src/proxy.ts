import { NextRequest, NextResponse } from "next/server";

/** The public deployment never serves admin pages or write endpoints. */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const adminOrigin = process.env.ADMIN_ORIGIN;
    if (!adminOrigin) return new Response("Not found", { status: 404 });
    return NextResponse.redirect(new URL(pathname + search, adminOrigin));
  }

  return new Response("Not found", { status: 404 });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/upload"],
};
