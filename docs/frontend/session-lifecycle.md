# Session Lifecycle — Verification Scenarios

This document defines the verification scenarios for Phase 5.1 auth.
Each scenario has a PASS/FAIL criterion.

---

## 1. Basic Login Flow

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter valid email + password
3. Click "Sign in"

**Expected:**
- `POST /api/v1/auth/login` returns 200
- Response body contains `accessToken`
- Cookie `wollyway_refresh_token` is set (httpOnly — NOT readable in Application tab)
- `GET /api/v1/users/profile` returns 200 with user data
- User name appears in the Navbar
- Redirected to the page specified by `?from=` or to `/`

**DevTools verification:**
- Application → Cookies → `wollyway_refresh_token`: value is NOT visible (shown as opaque by browser for httpOnly cookies)
- Application → Local Storage: NO auth tokens stored

---

## 2. Basic Register Flow

**Steps:**
1. Navigate to `/login`, switch to Register tab
2. Fill name (≥2 chars), email, password (≥8, uppercase/lowercase/digit/special)
3. Click "Create account"

**Expected:**
- `POST /api/v1/auth/register` returns 201
- Same token/cookie behavior as login
- Redirected and authenticated

---

## 3. Logout Flow

**Steps:**
1. Login successfully
2. Click Logout

**Expected:**
- `POST /api/v1/auth/logout` called
- `wollyway_refresh_token` cookie is cleared from browser
- User state cleared, redirected to `/`
- Navigating to `/profile` redirects to `/login?from=/profile`

---

## 4. Silent Refresh on Page Load

**Steps:**
1. Login (creates refresh cookie with 7-day lifetime)
2. Hard refresh the page (Ctrl+Shift+R)

**Expected:**
- Loading spinner shown briefly
- `POST /api/v1/auth/refresh` fires automatically
- `GET /api/v1/users/profile` fires after successful refresh
- User is authenticated without needing to log in again

---

## 5. Expired Access Token → Auto-Refresh (Key Scenario)

**Steps:**
1. Login
2. In DevTools Network tab, capture a `POST /api/v1/auth/login` response
3. Note the `accessToken` (15-minute JWT)
4. Wait 15 minutes (or modify token expiry to 15 seconds in backend `.env`)
5. Click any protected action (e.g., navigate to profile)

**Expected:**
- First request returns 401
- `POST /api/v1/auth/refresh` fires once automatically
- Original request is retried with new token
- User experience is seamless (no manual re-login)

---

## 6. Concurrent 401s → Single Refresh (Critical Concurrency Test)

**Steps:**
1. Login
2. Open browser console
3. Expire the access token manually:
   ```js
   // In console, clear the in-memory token (simulates expiry)
   // (This requires importing authToken in the console - alternative: wait for 15m)
   ```
4. Trigger 3 simultaneous API calls (e.g., load a page that fires 3 requests)

**Expected:**
- Exactly ONE `POST /api/v1/auth/refresh` appears in Network tab
- All 3 original requests eventually succeed
- Network tab shows: 3x original request (401) → 1x refresh → 3x retry

**Why this matters:** The backend rotates the refresh token on every call.
If 3 refresh calls fire simultaneously, only the first one succeeds;
the other two find a stale cookie and trigger security invalidation.

---

## 7. Refresh Token Rotation Verification

**Steps:**
1. Login → check `wollyway_refresh_token` value in Cookies (value IS shown in Application tab, but note it's a JWT blob)
2. Trigger a refresh (wait for access token to expire and fire any request)
3. Check the `wollyway_refresh_token` value again

**Expected:**
- Cookie value HAS CHANGED (new JWT issued)
- Old cookie value no longer accepted
- `POST /api/v1/auth/refresh` with old cookie manually (using Postman/curl) returns 403

**Security verification (using Postman):**
1. Note the original refresh token value from Application → Cookies
2. Let the app refresh normally (gets a new RT)
3. Use Postman to `POST /api/v1/auth/refresh` with the OLD refresh token in a manual Cookie header
4. Backend should return 403 "Security violation detected. All sessions revoked."
5. Verify that the app is also logged out (Redis invalidated all sessions)

---

## 8. CORS + Cookie Verification (Both Environments)

### Local (localhost:3000 → localhost:5000)

- Login at `http://localhost:3000/login`
- In DevTools → Network → `/login` response:
  - `Access-Control-Allow-Origin: http://localhost:3000` ✓
  - `Access-Control-Allow-Credentials: true` ✓
  - `Set-Cookie: wollyway_refresh_token=...; Path=/; HttpOnly; SameSite=Lax` ✓

### Production (Vercel → Render)

> ⚠️ Requires deploying the app to Vercel + backend to Render with:
> - Backend `CORS_ORIGIN=https://wollyway.vercel.app`
> - Backend `NODE_ENV=production`

- Login at `https://wollyway.vercel.app/login`
- In DevTools → Network → `/login` response:
  - `Access-Control-Allow-Origin: https://wollyway.vercel.app` ✓
  - `Access-Control-Allow-Credentials: true` ✓
  - `Set-Cookie: wollyway_refresh_token=...; Path=/; HttpOnly; Secure; SameSite=None` ✓

**Why SameSite=None for production?**
Vercel and Render are on different registrable domains (`.vercel.app` vs `.onrender.com`).
`SameSite=Strict` or `SameSite=Lax` blocks cookies on cross-site requests.
`SameSite=None; Secure` is the browser standard for cross-origin authenticated requests.

---

## 9. AuthGuard Route Protection

**Steps:**
1. Log out
2. Navigate directly to `http://localhost:3000/profile`

**Expected:**
- Brief loading spinner shown
- Redirected to `/login?from=%2Fprofile`
- After login, redirected back to `/profile`

---

## 10. Session-Expired Event

**Steps:**
1. Login
2. In backend, manually invalidate all sessions for the user in Redis
   (or wait for RT to expire after 7 days in a test)
3. Wait for access token to expire (15 min)
4. Navigate to any protected page

**Expected:**
- App fires a request → 401
- App fires `/auth/refresh` → 401 (Redis has no valid RT)
- `wollyway:session-expired` event dispatched
- Toast: "Your session has expired. Please log in again."
- Redirected to `/login`
- No infinite refresh loop

---

## Production Environment Checklist

Before launching production:

| Item | Required Value |
|------|---------------|
| Backend `CORS_ORIGIN` | `https://wollyway.vercel.app` |
| Backend `NODE_ENV` | `production` |
| Vercel env `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend.onrender.com/api/v1` |
| Backend `JWT_ACCESS_SECRET` | Strong 32+ char random secret |
| Backend `JWT_REFRESH_SECRET` | Strong 32+ char random secret (different) |
| Redis connection | Upstash or Railway Redis (not localhost) |
| HTTPS | Required for `Secure` cookie flag |
