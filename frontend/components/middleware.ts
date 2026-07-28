import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  const { pathname } = req.nextUrl;
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isProtected && !accessToken) {
    // Access token missing/expired — if we still have a refresh token,
    // let the request through and let a client-side check attempt a
    // refresh via /api/auth/refresh; otherwise send to login.
    if (!refreshToken) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};