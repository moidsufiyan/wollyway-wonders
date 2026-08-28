# HTTP Client Architecture

## Overview

All API communication goes through `src/lib/api-client.ts`.
This is the single integration point between the frontend and the WollyWay backend.

## Files

| File | Role |
|------|------|
| `src/lib/api-client.ts` | Fetch wrapper — auth headers, 401→refresh→retry, error normalization |
| `src/lib/auth-token.ts` | In-memory access token store |
| `src/types/auth.ts` | TypeScript contracts for all auth domain data |
| `src/services/auth.service.ts` | Auth-specific API calls (login, register, logout, refresh, profile) |

## Base URL

Configured via `NEXT_PUBLIC_API_BASE_URL` in `.env.local`.

```
Local:      http://localhost:5000/api/v1
Production: https://your-backend.onrender.com/api/v1
```

## How to Call an Endpoint

```ts
import { apiClient } from '@/lib/api-client';

// GET
const products = await apiClient.get<ProductListResponse>('/products');

// POST
const cart = await apiClient.post<CartResponse>('/cart/items', { productId, quantity });

// PATCH
const profile = await apiClient.patch<ProfileResponse>('/users/profile', { name });
```

The client automatically:
1. Injects `Authorization: Bearer <token>` if a token is in memory
2. Sets `credentials: 'include'` on every request (for the HTTP-only refresh cookie)
3. Parses JSON responses
4. On 401: attempts a single refresh, retries the original request once
5. Normalizes all errors to `ApiClientError`

## Error Handling

All errors thrown by `apiClient` are instances of `ApiClientError`:

```ts
import { ApiClientError } from '@/lib/api-client';

try {
  await apiClient.post('/checkout', payload);
} catch (error) {
  if (error instanceof ApiClientError) {
    console.log(error.status);          // HTTP status code
    console.log(error.message);         // Human-readable message
    console.log(error.errors);          // Array of field-level validation errors
    console.log(error.isNetworkError);  // True if fetch() itself failed (no connection)
  }
}
```

## The Refresh Lock

When multiple concurrent requests receive 401 simultaneously:

```
Request A ──401──┐
Request B ──401──┼──► ONE executeRefresh() call
Request C ──401──┘
                     ↓ new access token stored in authToken
          retry A ──► success
          retry B ──► success
          retry C ──► success
```

This is implemented via a module-level `refreshPromise` variable.
The second and third 401s see `refreshPromise !== null` and `await` the
existing promise instead of starting a new `/auth/refresh` request.

## Retry Limit

Each request is retried **at most once** after a successful refresh.
This is tracked by the `_retried: boolean` flag in `RequestOptions`.

If the retried request also returns 401 (e.g. user was suspended between
refresh and retry), we:
1. Clear the access token (`authToken.clear()`)
2. Dispatch `window.dispatchEvent(new CustomEvent('wollyway:session-expired'))`
3. Throw `ApiClientError(401)` — no further retries

## What is NOT in this client

- Product API calls → `src/services/api.ts` (mock, Phase 5.2)
- Cart API calls → `src/contexts/CartContext.tsx` (mock, Phase 5.3)
- Wishlist API calls → `src/contexts/WishlistContext.tsx` (mock, Phase 5.3)
- Order API calls → `src/hooks/useOrders.ts` (mock, Phase 5.5)
