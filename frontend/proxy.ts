import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function proxy(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;


    const path = request.nextUrl.pathname.replace(/\/$/, "");

    if (accessToken && (path === "/login" || path === "/signup")) {
      return NextResponse.next();
    }

    if (!accessToken && path.startsWith("/v1")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();

  } catch (error) {

    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
    '/v1/:path*',
    '/login',
    '/signup'
  ]
}
