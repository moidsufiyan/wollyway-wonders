"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { Toaster } from "@/components/ui/toaster";

/**
 * Providers — Unified Client-Side Provider Tree
 *
 * Strategy: Client Component First (ADR-0002).
 * All context providers live here, wrapped in "use client".
 * The root layout (Server Component) imports this file.
 *
 * Provider order (inner → outer dependency):
 *   QueryClientProvider  — server state (TanStack Query)
 *   AuthProvider         — auth state (localStorage-backed)
 *   CartProvider         — cart state (localStorage-backed, needs toast)
 *   WishlistProvider     — wishlist state (localStorage-backed, needs toast)
 */

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside component to avoid sharing between requests (SSR safety)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60 * 5, // 5 minutes
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            {children}
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
