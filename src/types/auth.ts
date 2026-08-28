/**
 * WollyWay — Auth Domain TypeScript Contracts
 *
 * These types describe the CLIENT-FACING API contract: the exact
 * shape of what the backend returns in JSON responses.
 * They are derived from the actual backend implementations in:
 *   - backend/src/controllers/auth.controller.ts
 *   - backend/src/controllers/user.controller.ts
 *   - backend/src/validators/auth.validator.ts
 */

// ─── Auth Status Machine ──────────────────────────────────────────────────────

/**
 * The complete set of states the authentication system can occupy.
 *
 * State transitions:
 *   idle       → loading        (on AuthProvider mount, silent refresh starts)
 *   loading    → authenticated  (silent refresh + /profile succeeded)
 *   loading    → unauthenticated (no valid refresh cookie)
 *   unauthenticated → loading   (login or register starts)
 *   loading    → authenticated  (login/register succeeded)
 *   loading    → error          (login/register failed)
 *   error      → unauthenticated (error acknowledged)
 *   authenticated → unauthenticated (logout or session expired)
 */
export type AuthStatus =
  | 'idle'            // Pre-boot; auth state unknown
  | 'loading'         // Silent refresh, login, or register in progress
  | 'authenticated'   // Valid access token + user profile loaded
  | 'unauthenticated' // No valid session
  | 'error';          // Auth operation failed (transitions back to unauthenticated)

// ─── User ─────────────────────────────────────────────────────────────────────

/**
 * The authenticated user data transfer object.
 * Matches the `data` field returned by GET /api/v1/users/profile.
 */
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin';
  status: 'active' | 'suspended' | 'deactivated';
  preferences?: {
    newsletter?: boolean;
    marketingEmails?: boolean;
    language?: string;
    currency?: string;
  };
}

// ─── Requests ─────────────────────────────────────────────────────────────────

/** POST /api/v1/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * POST /api/v1/auth/register
 *
 * Backend constraints (from auth.validator.ts):
 *   name:     2–50 chars, letters/spaces/dots/hyphens only
 *   email:    valid email
 *   password: ≥8 chars, uppercase + lowercase + digit + special char
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// ─── Responses ────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login response.
 * The accessToken is stored in-memory. The refresh token is set
 * as an HTTP-only cookie by the backend — it never appears here.
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'admin';
    status: string;
  };
}

/** POST /api/v1/auth/register — same shape as login response */
export type RegisterResponse = LoginResponse;

/**
 * POST /api/v1/auth/refresh response.
 * Only returns a new accessToken. The new refresh cookie is set
 * automatically by the backend — invisible to JavaScript.
 */
export interface RefreshResponse {
  success: boolean;
  accessToken: string;
}

/** GET /api/v1/users/profile */
export interface ProfileResponse {
  success: boolean;
  data: UserDTO;
}

// ─── Normalized API Error ─────────────────────────────────────────────────────

/** Individual validation field error from the backend */
export interface ApiErrorDetail {
  field?: string;
  message: string;
}

/**
 * Normalized frontend error produced by the API client.
 * Maps all backend error shapes into a predictable structure.
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  errors?: ApiErrorDetail[];
  isNetworkError: boolean;
  isTimeoutError: boolean;
}
