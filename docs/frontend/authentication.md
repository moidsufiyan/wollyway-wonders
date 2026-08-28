# Authentication Architecture

## Token Strategy

WollyWay uses a two-token authentication pattern:

| Token | Storage | Lifetime | Accessible to JS? |
|-------|---------|----------|-------------------|
| Access Token (JWT) | In-memory (module variable) | 15 minutes | Yes (this module only) |
| Refresh Token (JWT) | HTTP-only cookie | 7 days | NO — browser manages it |

### Why In-Memory for Access Tokens?

`localStorage` and `sessionStorage` are accessible to any JavaScript on the page.
An XSS attack (even via a compromised npm package) can silently steal tokens from either.

The in-memory store (`src/lib/auth-token.ts`) lives in a JS module closure.
External scripts running in the browser context cannot enumerate module-level variables.

**Trade-off:** The access token is lost on page refresh.
A silent refresh call (using the persisted HTTP-only cookie) re-hydrates it transparently.

### Why HTTP-Only for Refresh Tokens?

`httpOnly` cookies are sent by the browser automatically on matching requests,
but are NEVER readable by JavaScript — not even by this application's own code.

The backend sets the refresh cookie with:
- `httpOnly: true` — inaccessible to JS
- `secure: true` (production) — only sent over HTTPS
- `SameSite=None` (production) + `SameSite=Lax` (development)
- `path: /` — sent on all backend requests
- `maxAge: 7 days`

## Auth Flow

### Login

```
User submits email + password
   ↓
POST /api/v1/auth/login
   ↓
Backend: bcrypt.compare() → generate JWT pair
   ↓
Response body: { accessToken, data: { id, name, email, role } }
Response cookie: wollyway_refresh_token=<jwt>; httpOnly; SameSite=Lax
   ↓
Frontend: authToken.set(accessToken)  ← in-memory
Frontend: GET /api/v1/users/profile   ← fetch full user data
Frontend: setUser(profile)            ← AuthContext state
```

### Silent Refresh (Page Load)

```
Page loads / tab focused
   ↓
AuthContext.useEffect()
   ↓
POST /api/v1/auth/refresh
  Browser automatically sends wollyway_refresh_token cookie
   ↓
Backend: verify RT → check Redis → rotate token pair
   ↓
Response body: { accessToken: <new_jwt> }
Response cookie: wollyway_refresh_token=<new_jwt>; httpOnly (rotated)
   ↓
Frontend: authToken.set(newAccessToken)
Frontend: GET /api/v1/users/profile
Frontend: setAuthStatus('authenticated')
```

### Logout

```
User clicks Logout
   ↓
authToken.clear()  ← immediate local logout
   ↓
POST /api/v1/auth/logout
  Browser sends refresh cookie
   ↓
Backend: delete hashed RT from Redis
Backend: res.clearCookie(wollyway_refresh_token)
   ↓
Frontend: setUser(null), setAuthStatus('unauthenticated')
Frontend: router.push('/')
```

### Token Rotation Security

The backend uses a **token family** pattern:
- Each refresh token is stored SHA-256 hashed in Redis
- On refresh: old RT is deleted, new RT is stored
- If an old (already-rotated) RT is reused: **entire family is invalidated**
  (all sessions for that user are terminated — theft detection)

## AuthContext State Machine

```
idle
  └─► loading (mount: silent refresh starts)
        ├─► authenticated (success)
        └─► unauthenticated (no cookie / expired)
              └─► loading (login/register)
                    ├─► authenticated (success)
                    └─► unauthenticated (failure)

authenticated
  └─► unauthenticated (logout or session-expired event)
```

The `wollyway:session-expired` custom event is dispatched by `api-client.ts`
when a retried request still returns 401 after a refresh attempt.

## Security Boundary

```
AuthGuard (client-side)
────────────────────────
UX/navigation protection only.
Prevents unauthenticated users from SEEING protected UI.
Can be bypassed by technical users (JS manipulation).

Backend protect middleware (server-side)
────────────────────────────────────────
Real security boundary.
Verifies JWT signature, expiry, user existence, account status.
Cannot be bypassed — no valid token = no data.
```

**Never say "AuthGuard protects my routes."**
The correct statement is: **"The backend `protect` middleware authorizes access to data.
AuthGuard provides UX protection so users don't see protected UI."**
