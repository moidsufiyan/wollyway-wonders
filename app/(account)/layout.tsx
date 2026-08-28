/**
 * (account) Route Group Layout — Authentication Guard
 *
 * All routes inside app/(account)/ require authentication:
 *   /profile
 *   /wishlist
 *   /order-tracking
 *
 * The AuthGuard provides client-side UX protection.
 * The backend's `protect` middleware is the real security boundary.
 *
 * See src/components/auth/AuthGuard.tsx for the full security rationale.
 */
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
