/**
 * WollyWay — Centralized API Client
 *
 * ─── WHY A CENTRALIZED API CLIENT? ───────────────────────────────────────────
 *
 * Without a central client, every feature module would need to:
 *   - Know and hardcode the base URL
 *   - Attach Authorization headers manually on every call
 *   - Handle 401 → refresh → retry independently (causing refresh races)
 *   - Normalize backend error shapes differently in every file
 *
 * A single api-client handles all of this transparently. Every caller simply:
 *   apiClient.get('/products')
 *   apiClient.post('/cart/items', { productId, qty })
 * — the auth plumbing is invisible.
 *
 * ─── REFRESH RACE CONDITION PREVENTION ───────────────────────────────────────
 *
 * Problem: If 3 concurrent requests all receive 401 (expired access token),
 * a naïve implementation issues 3 separate /auth/refresh calls. The backend
 * uses refresh token ROTATION — each refresh invalidates the previous cookie
 * and issues a new one. So calls #2 and #3 would fail because call #1 already
 * rotated the token family, making their cookie stale.
 *
 * Solution: A module-level `refreshPromise` acts as a single-operation lock.
 * The first 401 starts the refresh and stores the Promise in `refreshPromise`.
 * All subsequent 401s in the same tick await THAT SAME Promise instead of
 * issuing new requests. When the Promise resolves, all waiters get the new
 * token simultaneously and retry their original requests exactly once.
 *
 *   Request A ──401──┐
 *   Request B ──401──┼──► ONE refreshPromise (single /auth/refresh call)
 *   Request C ──401──┘
 *                         ↓ new access token
 *              retry A ──► response A
 *              retry B ──► response B
 *              retry C ──► response C
 *
 * ─── RETRY LIMIT (NO INFINITE LOOPS) ─────────────────────────────────────────
 *
 * Each original request is retried AT MOST ONCE after a successful refresh.
 * This is enforced by the `_retried` flag passed through the request options.
 *
 *   /api/foo ──401──► refresh ──► retry /api/foo  ← at most once
 *
 * If the retried request returns 401 again (e.g. the user was suspended
 * between the refresh and the retry), we clear auth state and redirect
 * to login — we do NOT loop again.
 *
 * If the /auth/refresh call itself returns 401/403 (expired or reused cookie),
 * we clear auth state and dispatch an event for AuthContext to react to.
 *
 * ─── CORS + CREDENTIALS ──────────────────────────────────────────────────────
 *
 * All requests use `credentials: 'include'` so that:
 *   - The HTTP-only refresh cookie is sent to the backend on every request
 *   - The backend can set/clear the refresh cookie via Set-Cookie headers
 *
 * This requires the backend to have `credentials: true` in CORS config and
 * an explicit `Access-Control-Allow-Origin` (not *).
 *
 * See docs/frontend/backend-integration.md for production CORS requirements.
 */

import { authToken } from './auth-token';

// ─── Configuration ────────────────────────────────────────────────────────────

/**
 * Base URL for all API requests.
 *
 * Set NEXT_PUBLIC_API_BASE_URL in .env.local for local development.
 * Set it in Vercel environment variables for production.
 *
 * IMPORTANT: NEXT_PUBLIC_ prefix makes this value available to the browser
 * bundle. Do NOT put secrets in NEXT_PUBLIC_ variables.
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';

// ─── Normalized Error Class ───────────────────────────────────────────────────

/**
 * ApiClientError is the single error type thrown by this module.
 * All errors — network failures, HTTP errors, backend validation errors —
 * are normalized into this shape so callers have one predictable error format.
 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly errors?: { field?: string; message: string }[];
  readonly isNetworkError: boolean;
  readonly isTimeoutError: boolean;

  constructor(
    message: string,
    status: number,
    opts?: {
      code?: string;
      errors?: { field?: string; message: string }[];
      isNetworkError?: boolean;
      isTimeoutError?: boolean;
    }
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = opts?.code;
    this.errors = opts?.errors;
    this.isNetworkError = opts?.isNetworkError ?? false;
    this.isTimeoutError = opts?.isTimeoutError ?? false;
  }
}

// ─── Single In-Flight Refresh Lock ───────────────────────────────────────────

/**
 * Module-level refresh lock.
 *
 * When non-null: a refresh is already in progress. New callers await
 * this promise instead of creating a second /auth/refresh request.
 *
 * Set to null: no refresh is active. The next 401 will start a new one.
 *
 * The lock is cleared in the `finally` block of executeRefresh(),
 * ensuring it is always released even if the refresh itself throws.
 */
let refreshPromise: Promise<string> | null = null;

/**
 * Execute one /auth/refresh request, or join an existing one.
 *
 * Uses a raw fetch (not through the apiClient request function) to
 * avoid any possibility of triggering another 401 → refresh loop.
 *
 * Returns the new access token string on success.
 * Throws ApiClientError on failure (expired cookie, stolen token, etc.).
 */
async function executeRefresh(): Promise<string> {
  // If a refresh is already in-flight, wait for it — don't start a new one
  if (refreshPromise !== null) {
    return refreshPromise;
  }

  refreshPromise = (async (): Promise<string> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Browser sends the HTTP-only refresh cookie
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new ApiClientError(
          'Session expired. Please log in again.',
          response.status
        );
      }

      const data = (await response.json()) as { accessToken: string };
      authToken.set(data.accessToken);
      return data.accessToken;
    } finally {
      // ALWAYS clear the lock — even on failure — so future requests can retry
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Request Options ──────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /**
   * Internal retry guard.
   * When true, a 401 on this request will NOT trigger another refresh.
   * This prevents infinite refresh → retry loops.
   * Never set this to true from outside this module.
   */
  _retried?: boolean;
}

// ─── Core Request Function ────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, _retried = false } = options;

  // Attach the current access token to the Authorization header if available
  const token = authToken.get();
  const wasAuthenticated = !!token;
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // ─── Network Request ──────────────────────────────────────────────────────

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      credentials: 'include', // Required: sends refresh cookie for logout/refresh routes
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    // fetch() itself throws on network failure, CORS errors, or DNS failure
    throw new ApiClientError(
      'Network error. Please check your internet connection.',
      0,
      { isNetworkError: true }
    );
  }

  // ─── 401 Handler: Refresh + One Retry ─────────────────────────────────────

  if (response.status === 401 && !_retried) {
    try {
      // Wait for the single shared refresh (or join an in-progress one)
      await executeRefresh();

      // Retry the ORIGINAL request exactly once, with the new token
      // _retried: true prevents this retry from triggering another refresh
      return request<T>(path, { ...options, _retried: true });
    } catch {
      // Refresh failed (expired cookie, token reuse detected, etc.)
      authToken.clear();

      // Signal AuthContext to clear its state and redirect to login
      if (typeof window !== 'undefined' && wasAuthenticated) {
        window.dispatchEvent(new CustomEvent('wollyway:session-expired'));
      }

      throw new ApiClientError(
        'Your session has expired. Please log in again.',
        401
      );
    }
  }

  // ─── Parse Response ────────────────────────────────────────────────────────

  let responseData: unknown;
  const contentType = response.headers.get('content-type');

  try {
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
  } catch {
    throw new ApiClientError(
      'Failed to parse server response.',
      response.status
    );
  }

  // ─── HTTP Error ────────────────────────────────────────────────────────────

  if (!response.ok) {
    // Normalize the backend error response shape into ApiClientError
    const errData = responseData as {
      message?: string;
      error?: string;
      errors?: { field?: string; message: string }[];
    };

    throw new ApiClientError(
      errData.message ?? errData.error ?? `Request failed with status ${response.status}`,
      response.status,
      { errors: errData.errors }
    );
  }

  return responseData as T;
}

// ─── Public HTTP Method Helpers ───────────────────────────────────────────────

/**
 * The public API surface. Each method is a thin wrapper around `request()`.
 *
 * Usage:
 *   const user = await apiClient.get<UserDTO>('/users/profile');
 *   const order = await apiClient.post<OrderDTO>('/orders', payload);
 */
export const apiClient = {
  get: <T>(path: string, headers?: Record<string, string>): Promise<T> =>
    request<T>(path, { method: 'GET', headers }),

  post: <T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> =>
    request<T>(path, { method: 'POST', body, headers }),

  patch: <T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> =>
    request<T>(path, { method: 'PATCH', body, headers }),

  put: <T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> =>
    request<T>(path, { method: 'PUT', body, headers }),

  delete: <T>(path: string, headers?: Record<string, string>): Promise<T> =>
    request<T>(path, { method: 'DELETE', headers }),
};
