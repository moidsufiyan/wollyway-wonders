import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware
 *
 * ─── CURRENT STATE (Phase 5.1) ────────────────────────────────────────────────
 *
 * This middleware is a pass-through. It does NOT perform authentication checks.
 *
 * WHY NOT CHECK AUTH IN MIDDLEWARE?
 *
 * The access token is stored in-memory (a module-level JS variable in
 * src/lib/auth-token.ts). Edge Middleware runs in a separate V8 isolate from
 * the browser's JavaScript context — it cannot read in-memory variables from
 * client-side modules.
 *
 * The refresh token IS in a cookie, but it is `httpOnly` — middleware
 * cannot read httpOnly cookies from JavaScript (by design: httpOnly cookies
 * are inaccessible to ALL JavaScript, including server-side Edge functions).
 *
 * Route protection is therefore handled client-side by <AuthGuard>, which:
 *   1. Waits for the AuthProvider's silent refresh to complete
 *   2. Checks the resulting authStatus
 *   3. Redirects unauthenticated users to /login?from=<pathname>
 *
 * ─── FUTURE PATH: Middleware Auth (Phase 6+) ──────────────────────────────────
 *
 * If we switch to storing a short-lived access token in a non-httpOnly cookie
 * (accessible to middleware), this file would verify it with a lightweight JWT
 * check (no DB call — just signature verification) and redirect immediately,
 * before any React rendering happens. That provides faster redirects and true
 * server-side route protection.
 *
 * For now, the backend's `protect` middleware remains the authoritative
 * security boundary — not this file and not AuthGuard.
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
