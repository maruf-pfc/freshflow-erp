import { type NextRequest, NextResponse } from "next/server";

// Routes that require an authenticated session
const PROTECTED_PREFIXES = [
  "/overview",
  "/inventory",
  "/orders",
  "/customers",
  "/wastage",
  "/analytics",
  "/profile",
];

// Routes only accessible to unauthenticated visitors
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("freshflow_session")?.value;
  const isAuthenticated = Boolean(sessionToken);

  // 1. Check if user is attempting to access a protected dashboard route
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Handle root route /
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Prevent already-authenticated users from lingering on login/register
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/overview/:path*",
    "/inventory/:path*",
    "/orders/:path*",
    "/customers/:path*",
    "/wastage/:path*",
    "/analytics/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
