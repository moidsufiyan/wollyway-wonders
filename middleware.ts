import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware
 * 
 * This middleware is currently a pass-through. 
 * Route protection is handled client-side by <AuthGuard> because the access token 
 * is stored in-memory and the refresh token is httpOnly.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api         (Next.js API routes)
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico  (favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
