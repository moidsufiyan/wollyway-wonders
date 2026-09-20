/**
 * WollyWay — In-Memory Access Token Store
 * 
 * Stores the JWT access token in memory to prevent XSS exfiltration from localStorage.
 * The token is lost on page refresh, and restored via a silent refresh utilizing the HTTP-only cookie.
 */

let _accessToken: string | null = null;

export const authToken = {
  /**
   * Retrieve the current in-memory access token.
   * Returns null if no session is active or token has been cleared.
   */
  get: (): string | null => _accessToken,

  /**
   * Store a new access token in memory.
   * Called after a successful login, register, or refresh.
   */
  set: (token: string): void => {
    _accessToken = token;
  },

  /**
   * Remove the access token from memory.
   * Called on logout, session expiry, or refresh failure.
   * Does NOT affect the HTTP-only refresh cookie — that is cleared
   * by the backend via POST /auth/logout.
   */
  clear: (): void => {
    _accessToken = null;
  },
};
