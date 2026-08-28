/**
 * WollyWay — In-Memory Access Token Store
 *
 * ─── WHY IN-MEMORY? ───────────────────────────────────────────────────────────
 *
 * Access tokens in localStorage are readable by ANY JavaScript running on
 * the page. A malicious script injected via XSS (e.g. a compromised third-party
 * npm package, a script injection in user-generated content) can silently read
 * localStorage and exfiltrate the token.
 *
 * In-memory storage (a module-level variable) is NOT accessible to external
 * scripts — it lives inside this module's closure. An attacker executing code
 * in the browser context cannot enumerate module-level variables in another
 * bundled module.
 *
 * ─── THE TRADE-OFF ────────────────────────────────────────────────────────────
 *
 * The access token is lost when the browser tab is refreshed or closed.
 * On the next page load, AuthContext triggers a SILENT REFRESH request:
 *
 *   Page load
 *     ↓
 *   POST /auth/refresh  (HTTP-only refresh cookie sent automatically)
 *     ↓
 *   New access token returned in JSON body
 *     ↓
 *   authToken.set(newToken)
 *     ↓
 *   User is seamlessly authenticated
 *
 * The refresh cookie IS persisted by the browser across refreshes.
 * It is `httpOnly` — JavaScript (and this module) can NEVER read it directly.
 * The browser handles sending it automatically on requests to the backend.
 *
 * ─── SECURITY NOTE ────────────────────────────────────────────────────────────
 *
 * Never import and expose `_accessToken` directly.
 * Always use the `authToken` object's methods.
 * Never serialize this token into localStorage, sessionStorage, or any cookie.
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
