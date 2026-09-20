"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users. Defaults to '/login'. */
  redirectTo?: string;
}

export function AdminGuard({ children, redirectTo = '/login' }: AdminGuardProps) {
  const { isAuthenticated, authStatus, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect once auth state has fully resolved
    if (authStatus === 'unauthenticated' || authStatus === 'error') {
      const destination = `${redirectTo}?from=${encodeURIComponent(pathname)}`;
      router.push(destination);
    }
  }, [authStatus, redirectTo, pathname, router]);

  // While auth is resolving (idle → loading), render a spinner
  if (authStatus === 'idle' || authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-8 h-8 border-4 border-wolly-magenta border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated or error: render nothing while redirect is executing
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated but NOT admin: render 403 Access Denied
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 text-destructive flex items-center justify-center rounded-full">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to view the administrator dashboard. 
              Please contact an administrator if you believe this is an error.
            </p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  // Authenticated AND admin: render protected admin content
  return <>{children}</>;
}
