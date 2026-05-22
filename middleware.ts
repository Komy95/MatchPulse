import { NextResponse, type NextRequest } from "next/server";

const protectedAppRoutes = ["/dashboard", "/groups", "/join"];

export function middleware(request: NextRequest) {
  const isProtectedRoute = protectedAppRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (request.cookies.has("__session")) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/groups/:path*", "/join"],
};
