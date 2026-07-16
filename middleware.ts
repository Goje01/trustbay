import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPrefixes = [
  "/seller",
  "/checkout",
  "/download",
  "/chat",
  "/report",
  "/terms/buyer",
  "/marketplace/warning"
];

const ADMIN_COOKIE_NAME = "tb_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!adminCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const [role] = adminCookie.split(".");
    if (role !== "ceo" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/admin/login?unauthorized=1", request.url));
    }
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production"
  });

  if (protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    if (!token) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/checkout/:path*",
    "/download/:path*",
    "/chat/:path*",
    "/report/:path*",
    "/terms/buyer",
    "/marketplace/warning"
  ]
};