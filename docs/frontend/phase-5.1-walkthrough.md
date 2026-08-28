# Phase 5.1 Walkthrough — Frontend Core HTTP Client & Authentication

## Overview
Phase 5.1 successfully connects the Next.js frontend to the Express backend for the first time, establishing a secure, scalable foundation for all future API integrations.

We replaced the mock `localStorage` authentication with a real, robust JWT implementation that follows security best practices (in-memory access tokens, HTTP-only refresh cookies).

## What Was Completed

1. **Centralized API Client (`src/lib/api-client.ts`)**
   - Built a fetch wrapper that automatically handles token injection.
   - Implemented a robust single-promise refresh lock to prevent concurrent 401 requests from triggering multiple token rotations.
   - Added a strict one-retry limit to prevent infinite refresh loops.
   - Standardized error handling into a predictable `ApiClientError` class.

2. **Real Authentication Service (`src/services/auth.service.ts`)**
   - Connected `login`, `register`, `logout`, `refresh`, and `getProfile` to the real backend endpoints.
   - Used raw `fetch` for the refresh call to explicitly break the retry cycle.

3. **AuthContext Refactor (`src/contexts/AuthContext.tsx`)**
   - Replaced mock logic with real API calls.
   - Preserved the existing `User` shape and context contract to avoid breaking existing UI components.
   - Added a silent refresh on mount to re-hydrate the session from the HTTP-only cookie.
   - Added a `wollyway:session-expired` event listener to gracefully handle token expiration/theft scenarios.

4. **Client-Side AuthGuard (`src/components/auth/AuthGuard.tsx`)**
   - Created a UX navigation guard that prevents unauthenticated users from seeing protected UI.
   - Wrapped the `(account)` route group, `/checkout`, and `/checkout-success` pages.
   - Documented the critical distinction between this UX guard and the backend's real `protect` middleware security boundary.

5. **Production Backend Fixes (Critical)**
   - Updated `backend/src/app.ts` and `backend/src/config/env.config.ts` to support comma-separated `CORS_ORIGIN` (allowing both localhost and Vercel simultaneously).
   - Fixed the `SameSite` cookie configuration in `auth.controller.ts` to dynamically use `Lax` in development and `None` (with `Secure`) in production, which is required for cross-origin authentication on Vercel/Render.

6. **Documentation**
   - Created comprehensive guides in `docs/frontend/`:
     - `http-client.md`
     - `authentication.md`
     - `session-lifecycle.md`
     - `backend-integration.md`

## Build Verification
- Backend TypeScript compilation: **PASS**
- Backend ESLint: **PASS**
- Frontend Next.js Production Build (`npm run build`): **PASS** (Compiled successfully in ~5.3 mins)

## Next Steps
Before proceeding to Phase 5.2 (Product Domain Integration), it is recommended to manually verify the authentication flow:
1. Start both servers (`npm run dev` in both frontend and backend).
2. Register a new user or login with an existing one.
3. Verify that the `wollyway_refresh_token` cookie is set correctly (httpOnly).
4. Verify that you can access the `/profile` page.
5. Verify that clicking Logout redirects you to the home page and clears the cookie.
