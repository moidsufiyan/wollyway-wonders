"use client";

/**
 * WollyWay — AuthContext
 *
 * Phase 5.1: Replaced mock localStorage authentication with real backend
 * API calls via authService. The public interface (useAuth hook, AuthProvider,
 * User shape, login/register/logout/updateProfile) is preserved for backward
 * compatibility with all existing components.
 *
 * ─── What Changed vs. the Mock ───────────────────────────────────────────────
 * BEFORE: Validated credentials against a static users.json file in memory.
 *         Stored a fake mock_token_* in localStorage. Used localStorage as
 *         the source of truth for the authenticated user object.
 *
 * AFTER:  Calls POST /api/v1/auth/login (real bcrypt verification, Redis lockout).
 *         Backend sets an HTTP-only refresh cookie — JS never sees it.
 *         Access token is stored in a module-level in-memory variable only.
 *         On page load, a silent refresh attempt re-hydrates the session.
 *         On session expiry, the `wollyway:session-expired` custom event
 *         dispatched by the API client triggers logout here.
 *
 * ─── What Remains ─────────────────────────────────────────────────────────────
 * Cart (localStorage), Wishlist (localStorage), Product/Order (mock) are
 * still mock-backed — their migration is Phases 5.2–5.5.
 *
 * ─── Auth State Machine ───────────────────────────────────────────────────────
 *   idle            → loading        (mount: silent refresh begins)
 *   loading         → authenticated  (refresh + profile succeeded)
 *   loading         → unauthenticated (no valid refresh cookie)
 *   unauthenticated → loading        (login or register called)
 *   loading         → authenticated  (login/register succeeded)
 *   loading         → unauthenticated (login/register failed)
 *   authenticated   → unauthenticated (logout or session-expired event)
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { authToken } from '@/lib/auth-token';
import { ApiClientError } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { UserDTO, AuthStatus } from '@/types/auth';

// ─── User Shape ───────────────────────────────────────────────────────────────
// Preserved from the original AuthContext so that all consuming components
// (Profile.tsx, Navbar.tsx, etc.) continue to compile without changes.

type User = {
  id?: string;
  _id?: string;        // Alias for Mongoose ObjectId (some components use _id)
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role?: string;
  status?: string;
  preferences?: {
    newsletter?: boolean;
    marketingEmails?: boolean;
    language?: string;
    currency?: string;
  };
};

// ─── Context Contract ─────────────────────────────────────────────────────────
// Extends the original interface with `authStatus` for components that need
// fine-grained state (e.g. AuthGuard). The existing fields are unchanged.

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authStatus: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map the backend UserDTO to the frontend User shape */
function mapDTOToUser(dto: UserDTO): User {
  return {
    id: dto.id,
    _id: dto.id,
    name: dto.name,
    email: dto.email,
    avatar: dto.avatar,
    phone: dto.phone,
    role: dto.role,
    status: dto.status,
    preferences: dto.preferences,
  };
}

/**
 * Extract a human-readable message from an error.
 * ApiClientError from the API client includes normalized backend messages.
 * Validation errors (array of field errors) are joined into a single string.
 */
function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    if (error.errors && error.errors.length > 0) {
      return error.errors.map((e) => e.message).join('. ');
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Derived convenience flags (backward compatible with existing components)
  const isAuthenticated = authStatus === 'authenticated';
  const isLoading = authStatus === 'idle' || authStatus === 'loading';

  // ─── Session Expiry Handler ───────────────────────────────────────────────
  // The API client dispatches 'wollyway:session-expired' when:
  //   - A retried request (after refresh) returns 401
  //   - The refresh token itself is expired or detected as reused

  const handleSessionExpired = useCallback(() => {
    setUser(null);
    authToken.clear();
    setAuthStatus('unauthenticated');
    queryClient.clear(); // Clear cart/wishlist cache
    toast({
      title: 'Session expired',
      description: 'Your session has expired. Please log in again.',
      variant: 'destructive',
    });
    router.push('/login');
  }, [toast, router, queryClient]);

  // ─── Boot: Silent Refresh ─────────────────────────────────────────────────
  // On every page load/tab activation:
  //   1. Attempt POST /auth/refresh using the persisted HTTP-only cookie
  //   2. If successful, fetch the user profile to populate auth state
  //   3. If the cookie is missing/expired, set state to 'unauthenticated'
  //
  // This is the mechanism that makes in-memory token storage work across
  // page refreshes without requiring localStorage tokens.

  useEffect(() => {
    // ── Migration: Remove stale mock user from localStorage ──────────────────
    // The old mock auth system stored { token: 'mock_token_...' } in localStorage.
    // We clean this up once on first load to avoid confusion.
    if (typeof window !== 'undefined') {
      const staleUser = localStorage.getItem('user');
      if (staleUser) {
        try {
          const parsed = JSON.parse(staleUser) as { token?: string };
          if (parsed?.token?.startsWith('mock_token_')) {
            localStorage.removeItem('user');
          }
        } catch {
          localStorage.removeItem('user');
        }
      }
    }

    // ── Register session-expired event listener ──────────────────────────────
    window.addEventListener('wollyway:session-expired', handleSessionExpired);

    // ── Attempt silent refresh ───────────────────────────────────────────────
    const initAuth = async () => {
      setAuthStatus('loading');
      try {
        await authService.refresh();
        const profile = await authService.getProfile();
        setUser(mapDTOToUser(profile));
        setAuthStatus('authenticated');
      } catch {
        // No valid refresh cookie — user is not logged in
        authToken.clear();
        setAuthStatus('unauthenticated');
      }
    };

    initAuth();

    return () => {
      window.removeEventListener('wollyway:session-expired', handleSessionExpired);
    };
  }, [handleSessionExpired]);

  // ─── Login ────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<void> => {
    setAuthStatus('loading');
    try {
      const response = await authService.login({ email, password });
      // Fetch the full profile from /users/profile to get all user fields
      const profile = await authService.getProfile();
      setUser(mapDTOToUser(profile));
      setAuthStatus('authenticated');
      queryClient.invalidateQueries(); // Force refresh of cart/wishlist
      toast({
        title: 'Login successful',
        description: `Welcome back, ${response.data.name}!`,
      });
    } catch (error) {
      setAuthStatus('unauthenticated');
      const message = extractErrorMessage(error, 'Invalid email or password.');
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
      throw error; // Re-throw so the Login form can catch it and show inline error
    }
  };

  // ─── Register ─────────────────────────────────────────────────────────────

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    setAuthStatus('loading');
    try {
      const response = await authService.register({ name, email, password });
      const profile = await authService.getProfile();
      setUser(mapDTOToUser(profile));
      setAuthStatus('authenticated');
      queryClient.invalidateQueries(); // Force refresh of cart/wishlist
      toast({
        title: 'Account created',
        description: `Welcome to WollyWay, ${response.data.name}!`,
      });
    } catch (error) {
      setAuthStatus('unauthenticated');
      const message = extractErrorMessage(error, 'Could not create account.');
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
      throw error; // Re-throw so the register form can catch it and show inline error
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  // Sequence:
  //   1. Call backend (clears refresh cookie from Redis + clears Set-Cookie)
  //   2. Clear in-memory access token
  //   3. Clear user state
  //   4. Redirect to home page
  //
  // The finally block ensures local cleanup happens even if the network call fails.

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      authToken.clear();
      setAuthStatus('unauthenticated');
      queryClient.clear(); // Clear all cached user data (cart, wishlist, etc)
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    }
  };

  // ─── Update Profile ───────────────────────────────────────────────────────

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const updated = await authService.updateProfile({
        name: userData.name,
        phone: userData.phone,
        avatar: userData.avatar,
        preferences: userData.preferences,
      });
      setUser(mapDTOToUser(updated));
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      const message = extractErrorMessage(error, 'Could not update profile.');
      toast({
        title: 'Update failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // ─── Context Value ────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authStatus,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
