# Frontend ↔ Backend Integration Guide

## Environment Configuration

### Local Development

`.env.local` (never committed, in `.gitignore`):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

Backend `.env`:
```
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Production

Vercel dashboard → Environment Variables:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

Backend (Render) environment variables:
```
CORS_ORIGIN=https://wollyway.vercel.app
NODE_ENV=production
```

Or to support both dev and prod simultaneously:
```
CORS_ORIGIN=http://localhost:3000,https://wollyway.vercel.app
```

---

## CORS Requirements

The backend must have:
```ts
cors({
  origin: allowedOriginsFunction,  // NOT '*'
  credentials: true,               // REQUIRED for cookies
})
```

The frontend must have:
```ts
fetch(url, {
  credentials: 'include',  // REQUIRED to send/receive cookies
})
```

**Why `credentials: 'include'` is non-negotiable:**
The HTTP-only refresh token cookie will NOT be sent in cross-origin requests
without `credentials: 'include'` on the frontend AND `credentials: true` on the CORS config.
If either is missing, the refresh flow silently fails.

---

## Cookie Behavior by Environment

| Environment | SameSite | Secure | Behavior |
|-------------|----------|--------|----------|
| Development | `Lax` | `false` | Cookie sent: same host (localhost), cross-port |
| Production | `None` | `true` | Cookie sent: cross-origin (Vercel → Render) |

`SameSite=None` requires `Secure=true` (HTTPS). Any production deployment
MUST be over HTTPS for the refresh cookie to work.

---

## Backend API Surface (Phase 5.1 Integration Points)

All endpoints require `credentials: 'include'` on the frontend.

| Endpoint | Auth Required | Frontend Usage |
|----------|--------------|----------------|
| `POST /api/v1/auth/register` | No | `authService.register()` |
| `POST /api/v1/auth/login` | No | `authService.login()` |
| `POST /api/v1/auth/logout` | No (cookie) | `authService.logout()` |
| `POST /api/v1/auth/refresh` | HTTP-only cookie | `authService.refresh()`, `executeRefresh()` |
| `GET /api/v1/users/profile` | Bearer token | `authService.getProfile()` |
| `PATCH /api/v1/users/profile` | Bearer token | `authService.updateProfile()` |

---

## Mock Domains (Integration Complete)

All frontend domains (Auth, Products, Cart, Wishlist, Checkout, Orders) have now been successfully migrated to consume live backend APIs via `TanStack Query` and `apiClient`.

Legacy mock services such as `src/services/api.ts` have been fully purged from the codebase.

---

## Adding New API Calls (Pattern)

For any new backend endpoint integration, follow this pattern:

1. **Add types** to `src/types/<domain>.ts`
2. **Create service** in `src/services/<domain>.service.ts`
   ```ts
   import { apiClient } from '@/lib/api-client';
   
   export const productService = {
     getProducts: () => apiClient.get<ProductListResponse>('/products'),
     getProduct: (id: string) => apiClient.get<ProductResponse>(`/products/${id}`),
   };
   ```
3. **Use in components** via TanStack Query (if server data) or directly for mutations

The `apiClient` handles authentication, token refresh, and error normalization automatically.

---

## Troubleshooting

### "Network error" on every request
- Is the backend running? `npm run dev` in `/backend`
- Is `NEXT_PUBLIC_API_BASE_URL` set correctly in `.env.local`?

### 401 on every request after login
- Check that the access token is being injected: Network → request headers → `Authorization: Bearer <token>`
- Check that `authToken.set()` was called after login

### Refresh cookie not being sent
- Check `credentials: 'include'` on the fetch calls
- Check that `Access-Control-Allow-Credentials: true` is in the CORS response headers
- Check that the cookie's `SameSite` matches the deployment environment

### CORS error in browser console
- Backend `CORS_ORIGIN` must exactly match the frontend origin (including protocol and port)
- `http://localhost:3000` and `http://localhost:3000/` are NOT the same — no trailing slash
