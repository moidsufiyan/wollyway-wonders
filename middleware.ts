import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware (Milestone 7)
 *
 * Currently functions as a skeleton pass-through because authentication is client-side
 * (localStorage-backed). In a production environment with a backend, this middleware
 * would intercept requests to protected routes (/profile, /checkout) by reading an auth cookie.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
