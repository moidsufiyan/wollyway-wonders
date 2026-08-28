"use client";

/**
 * WollyWay — AuthGuard
 *
 * Client-side UX/navigation protection for authenticated routes.
 *
 * ─── CRITICAL: THIS IS NOT A SECURITY BOUNDARY ───────────────────────────────
 *
 * AuthGuard is a CLIENT-SIDE NAVIGATION GUARD only.
 *
 * What AuthGuard provides:
 *   ✓ Prevents unauthenticated users from SEEING protected UI
 *   ✓ Prevents flash of protected content during auth state resolution
 *   ✓ Redirects unauthenticated users to /login?from=<current-path>
 *   ✓ Shows a loading spinner while the auth state is being resolved
 *
 * What AuthGuard does NOT provide:
 *   ✗ Does NOT protect your DATA — that is the backend's job
 *   ✗ Does NOT verify JWT signatures
 *   ✗ Does NOT check token expiry directly
 *   ✗ Does NOT prevent a technically determined user from bypassing the UI
 *
 * ─── THE REAL SECURITY BOUNDARY ──────────────────────────────────────────────
 *
 * The backend's `protect` middleware (auth.middleware.ts) is the authoritative
 * security layer. It:
 *   - Verifies the JWT access token cryptographic signature (HS256)
 *   - Confirms the token has not expired (15-minute lifetime)
 *   - Confirms the user still exists in the database
 *   - Confirms the user's account status is 'active'
 *   - Confirms the password has not changed since the token was issued
 *   - Returns HTTP 401 for any invalid, expired, or suspicious token
 *
 * Even if a user somehow bypasses AuthGuard (e.g., by disabling JavaScript),
 * they cannot retrieve any protected data because EVERY backend API endpoint
 * requires a valid Bearer token that only the real login/refresh flow can
 * produce.
 *
 * Mental model:
 *
 *   AuthGuard                     Backend protect middleware
 *   ──────────────────            ──────────────────────────────
 *   UX / navigation guard         Real security boundary
 *   "Should this user SEE this?"  "Is this user AUTHORIZED to GET this data?"
 *
 * ─── WHY CLIENT-SIDE? ─────────────────────────────────────────────────────────
 *
 * The Next.js middleware (middleware.ts) runs on the Edge Runtime and can only
 * read COOKIE values, not in-memory JavaScript state. The access token is
 * stored in a module-level JS variable (not a cookie), so middleware cannot
 * read it. The refresh token IS in a cookie but it is `httpOnly` — even
 * middleware JS cannot read httpOnly cookies.
 *
 * Therefore, route protection must be done client-side, after the AuthProvider
 * has resolved the auth state via the silent refresh.
 */

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users. Defaults to '/login'. */
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { isAuthenticated, authStatus } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect once auth state has fully resolved (not idle/loading)
    if (authStatus === 'unauthenticated') {
      const destination = `${redirectTo}?from=${encodeURIComponent(pathname)}`;
      router.push(destination);
    }
  }, [authStatus, redirectTo, pathname, router]);

  // While auth is resolving (idle → loading → authenticated/unauthenticated),
  // render a spinner to prevent flash of protected content.
  if (authStatus === 'idle' || authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-8 h-8 border-4 border-wolly-magenta border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated: render nothing while the router redirect is executing
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated: render the protected content
  return <>{children}</>;
}
