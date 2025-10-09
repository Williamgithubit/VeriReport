import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.split("Bearer ")[1];

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/verify",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/")
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If there's no token and the route is not public, redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(loginUrl);
  }

  // For protected routes, verify the token
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      throw new Error("Server configuration error");
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    // Verify the JWT token
    const { payload } = await jwtVerify(token, secret);

    if (!payload || !payload.sub) {
      throw new Error("Invalid token payload");
    }

    // Token is valid, allow access
    const response = NextResponse.next();
    // Set user info in headers for the route handler
    response.headers.set("X-User-ID", payload.sub as string);
    response.headers.set("X-User-Email", payload.email as string);
    return response;
  } catch (error) {
    console.error("Token verification failed:", error);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Session expired. Please log in again.");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
