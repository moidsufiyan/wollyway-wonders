/**
 * WollyWay — Auth Service
 *
 * Real API calls to the backend authentication endpoints.
 * All endpoints verified from backend/src/routes/auth.routes.ts
 * and backend/src/controllers/auth.controller.ts.
 *
 * ─── Endpoint Map ─────────────────────────────────────────────────────────────
 *   POST /auth/register   → creates account, returns accessToken + sets RT cookie
 *   POST /auth/login      → verifies credentials, returns accessToken + sets RT cookie
 *   POST /auth/logout     → clears RT from Redis and clears cookie
 *   POST /auth/refresh    → rotates RT pair, returns new accessToken
 *   GET  /users/profile   → returns authenticated user's profile (requires Bearer token)
 *   PATCH /users/profile  → updates profile fields (requires Bearer token)
 */

import { apiClient } from '@/lib/api-client';
import { authToken } from '@/lib/auth-token';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
  ProfileResponse,
  UserDTO,
} from '@/types/auth';

// ─── Base URL (for the raw refresh call — must not go through apiClient) ──────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Authenticate with email + password.
   *
   * On success:
   *   - Backend sets the HTTP-only refresh cookie (RT)
   *   - accessToken is stored in memory by authToken.set()
   *   - Returns the full response for the caller to read user data
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    authToken.set(response.accessToken);
    return response;
  },

  /**
   * Create a new customer account.
   *
   * Backend constraints (from auth.validator.ts):
   *   name:     2–50 chars, letters/spaces/dots/hyphens only
   *   email:    valid email format
   *   password: ≥8 chars, must include uppercase, lowercase, digit, special char
   *
   * On success: same behavior as login (sets cookie + stores access token).
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    authToken.set(response.accessToken);
    return response;
  },

  /**
   * Log out the current session.
   *
   * Sequence:
   *   1. Clear the access token from memory immediately (local logout)
   *   2. Call the backend to: delete the RT from Redis + clear the cookie
   *
   * The backend call is best-effort. Even if it fails (network error),
   * the user is considered logged out locally. The RT will eventually
   * expire from Redis via its 7-day TTL.
   */
  async logout(): Promise<void> {
    // Clear local token first — regardless of network outcome
    authToken.clear();
    try {
      await apiClient.post<void>('/auth/logout');
    } catch {
      // Suppress — local logout is already complete
      // The HTTP-only cookie will be cleared by the backend when called,
      // or expire naturally after 7 days if this call fails.
    }
  },

  /**
   * Silent refresh: obtain a new access token using the HTTP-only refresh cookie.
   *
   * WHY RAW FETCH (not apiClient)?
   * ─────────────────────────────────────────────────────────────────────────
   * The api-client itself calls this function when it receives a 401.
   * If we used apiClient.post here, a failed refresh would trigger
   * another 401 → refresh → 401 → refresh... infinite loop.
   *
   * Using a raw fetch() here breaks that cycle entirely:
   * - The refresh endpoint is called directly
   * - If it returns a non-200, we throw — no retry, no loop
   * ─────────────────────────────────────────────────────────────────────────
   *
   * This is also called on app boot to silently re-hydrate the session
   * from the persisted HTTP-only refresh cookie.
   */
  async refresh(): Promise<RefreshResponse> {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Browser sends the HTTP-only refresh cookie
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Refresh failed with status ${response.status}`);
    }

    const data = (await response.json()) as RefreshResponse;
    // Store the new access token in memory
    authToken.set(data.accessToken);
    return data;
  },

  /**
   * Fetch the authenticated user's full profile.
   * Requires a valid access token (sent via Authorization header by apiClient).
   *
   * Used:
   *   1. After login/register to populate the user state in AuthContext
   *   2. After a silent refresh on page load to verify the user is still active
   */
  async getProfile(): Promise<UserDTO> {
    const response = await apiClient.get<ProfileResponse>('/users/profile');
    return response.data;
  },

  /**
   * Update the authenticated user's profile fields.
   *
   * Accepts any subset of: name, phone, avatar, preferences.
   * The backend merges these with existing values.
   */
  async updateProfile(data: Partial<Pick<UserDTO, 'name' | 'phone' | 'avatar' | 'preferences'>>): Promise<UserDTO> {
    const response = await apiClient.patch<ProfileResponse>('/users/profile', data);
    return response.data;
  },

  /**
   * Fetch all saved addresses for the authenticated user.
   */
  async getAddresses(): Promise<any[]> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/users/addresses');
    return response.data;
  },

  /**
   * Add a new address to the user's saved list.
   */
  async addAddress(address: any): Promise<any[]> {
    const response = await apiClient.post<{ success: boolean; data: any[] }>('/users/addresses', address);
    return response.data;
  },

  /**
   * Update an existing address.
   */
  async updateAddress(id: string, address: any): Promise<any[]> {
    const response = await apiClient.put<{ success: boolean; data: any[] }>(`/users/addresses/${id}`, address);
    return response.data;
  },

  /**
   * Delete an existing address.
   */
  async deleteAddress(id: string): Promise<any[]> {
    const response = await apiClient.delete<{ success: boolean; data: any[] }>(`/users/addresses/${id}`);
    return response.data;
  },
};
