import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken =
    request.cookies.get("accessToken")?.value;

  const path = request.nextUrl.pathname;

  // redirect logged-in users away from auth pages
  if (
    accessToken &&
    (path === "/login" || path === "/signup")
  ) {
    return NextResponse.redirect(
      new URL("/v1/dashboard", request.url)
    );
  }

  // protect private routes
  if (!accessToken && path.startsWith("/v1")) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/v1/:path*", "/login", "/signup"],
};