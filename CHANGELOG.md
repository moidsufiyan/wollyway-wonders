# Changelog

All notable changes to the WollyWay platform will be documented in this file.

---

## [Unreleased]

### Added
- **Phase 5.5: Final User Profile & Orders Integration:**
  - Integrated `authService` for live profile and address management, fetching and mutating addresses via `TanStack Query`.
  - Updated Address form UI to match backend requirements, capturing label, phone, and standardizing address fields.
  - Rewrote `OrderTracking.tsx` to read the `id` search param and consume the real `useOrder` hook instead of static mocks.
  - Updated `CheckoutSuccess.tsx` to correctly map integer-paisa derived order `financials` (subtotal, shippingFee, taxTotal, orderTotal) from backend.
  - Purged legacy `api.ts` mock `orderService` completely as all remaining views now communicate directly with the live server.
  - Addressed caching logic to immediately invalidate and refresh addresses list upon addition, modification, or deletion.

- **Phase 5.4: Checkout & Orders Migration:**
  - Integrated `useCheckout` and `useCheckoutSession` via `TanStack Query` to replace local storage checkout sequences.
  - Mapped Razorpay intent generation directly to backend `POST /api/v1/payments/create-intent` endpoint.
  - Implemented the actual checkout sequence workflow involving cart verification, intent generation, and the `Razorpay.open` modal trigger.
  - Reconciled order state properly by deferring payment fulfillment polling to the `/checkout/:sessionId/status` endpoint to handle webhook concurrency.
  - Enforced a secure checkout state polling loop to capture order transition from `PAYMENT_PENDING` to `COMPLETED` without relying on insecure client-side order IDs.
- **Phase 5.3: Cart & Wishlist Integration:**
  - Migrated `CartContext` and `WishlistContext` to utilize `TanStack Query` as the server-state ownership layer, dropping legacy `localStorage` usage.
  - Safely caught `401 Unauthorized` responses via `ApiClientError` interceptors, cleanly redirecting unauthenticated cart actions to `/login?from=` without silently zeroing out cached items.
  - Centralized frontend DTOs (`CartItemDTO`, `WishlistCardDTO`) and mapped them back into the unified `ProductViewModel` through `mapCartItemToUI` and `mapWishlistCardToUI` utility functions.
  - Implemented single-item fallback resolution in `useWishlistCheck` to avoid N+1 full-wishlist queries on isolated product views while maintaining seamless optimistic heart-toggle UI.
  - Used explicit `setQueryData` rather than network invalidations on Cart mutations to maintain optimistic UI performance and immediately reflect server-validated stock constraints, preventing UI desyncs.

- **Phase 5.2: Product Discovery & Catalog Integration:**
  - Migrated `useProducts` and `useProductSearch` hooks to fetch from real backend `GET /api/v1/products` discovery endpoint via `apiClient`.
  - Converted frontend `Product` type into a `ProductViewModel` utilizing a mapper/adapter pattern for seamless UI consumption of `ProductCardDTO` and `ProductDetailDTO`.
  - Refactored `Shop.tsx` to use URL Search Parameters as the absolute source of truth for all filters, sorting, and pagination (preserving native browser back/forward capabilities).
  - Gracefully omitted dummy business fields (colors, sizes, reviews, ratings) in UI where backend support does not yet exist without causing layout breakage.
  - Formatted integer paisa prices centrally using new `formatMoney` utility (`src/utils/currency.ts`) and completely eliminated client-side product list array filtering.
  - Integrated real `GET /api/v1/products/featured` endpoint in `FeaturedProducts` section and integrated `GET /api/v1/products/:slug` in `ProductDetail` view.

- **Payment Integration: Razorpay (Phase 4.5A):**
  - Provider-agnostic payment architecture (`IPaymentProvider`, `PaymentProviderFactory`) allowing seamless multi-gateway expansion.
  - Razorpay adapter (`RazorpayAdapter`) managing Order creation in integer paisa, receipt generation, and cryptographic HMAC SHA256 webhook signature verification (`timingSafeEqual`).
  - Client untrusted security boundary: only server-verified gateway webhooks invoke `OrderService.createOrderFromCheckout`.
  - Customer endpoint `POST /api/v1/payments/create-intent` with intent reuse idempotency on active checkout sessions.
  - Public webhook receiver `POST /api/v1/payments/webhook/razorpay` with raw byte buffer capture (`req.rawBody`).
  - Race-safe atomic event claiming using `payment_webhook_events` collection with unique compound index `{ eventId: 1, provider: 1 }` absorbing concurrent duplicate deliveries.
  - Multi-factor pre-order reconciliation: provider, gateway order ID, customer session binding, frozen snapshot amount, and currency (`INR`).
  - Webhook event lifecycle (`RECEIVED` -> `PROCESSING` -> `PROCESSED` | `FAILED` | `IGNORED`) marking `PROCESSED` only after order commit.
  - Comprehensive documentation (`docs/database/payment-domain.md`, `docs/api/payment-api.md`, `docs/architecture/payment-lifecycle.md`) and automated behavioral test suite (`scripts/verify-payment-domain.ts`).

- **Order Domain (Phase 4.4):**
  - Database schema (`Order` collection) with unique index on `orderNumber`, unique index on `checkoutSessionId`, unique sparse index on `paymentInfo.transactionId`, and compound index on `{ userId: 1, createdAt: -1 }`.
  - Multi-Document ACID Replica Set Transaction orchestration (`session.withTransaction`) uniting Order creation, permanent stock deductions, `InventoryTransaction` creation, `CheckoutSession` completion, and `Cart` clearing.
  - Frozen immutable historical snapshots for product lines (`name`, `price`, `slug`, `image`, `quantity`), customer contacts, shipping destination, and integer paisa financials.
  - Handcrafted inventory rule: `trackInventory: false` items increment `sold` without decrementing `available`.
  - Dual-index race-condition idempotency protection with Mongo `E11000` duplicate key handling.
  - Strict customer IDOR ownership verification returning `404 Not Found` for unauthorized lookups.
  - Explicit administrative fulfillment state machine (`CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`).
  - Idempotent order cancellation and automatic inventory restocking with `reason: 'return'` audit logs.
  - Active order product archival prevention guard in `ProductService.archiveProduct`.
  - Lean DTO projections for customer summaries, receipts, and administrative oversight.
  - Comprehensive documentation (`docs/database/order-domain.md`, `docs/api/order-api.md`, `docs/architecture/order-lifecycle.md`) and automated behavioral test suite (`scripts/verify-order-domain.ts`).

- **Checkout Domain (Phase 4.3):**
  - Database schema (`CheckoutSession` collection) with compound index `{ userId: 1, status: 1 }` and a 15-minute TTL auto-expiry index.
  - Multi-step validation pipeline: authentication -> cart validation -> product status checks -> live price comparisons -> address completeness.
  - Atomic Redis stock lock reservation system (`checkout:reservation:{checkoutSessionId}`) leveraging Lua Dry-Run checks to prevent overselling.
  - POST `/checkout/extend` allowing users to extend locks by +5 minutes (max 3 times).
  - GET `/checkout/current` to retrieve active checkout session state details.
  - Boot reconciliation sweep: checks and cancels expired checkout database records on server starts.
  - Safe idempotency checking for confirmation payments using `Idempotency-Key` headers.
  - Non-mutating read assertions during price and availability checks.
  - Contract interface definition (`docs/checkout-order-contract.md`) to integrate with Orders.

- **Cart Domain (Phase 4.2):**
  - Database schema (`Cart` collection) with unique index `{ userId: 1 }` and compound index `{ userId: 1, "items.productId": 1 }`.
  - Atomic upsert creation (`upsertCart`) and updates (`updateQuantity` with positional array filters).
  - Derived subtotal mapping dynamically on read rather than caching.
  - Verification of quantity limits (`MAX_CART_ITEM_QUANTITY` default: 10) and stock availability.
  - Concurrency retry strategy with exponential backoff (50ms, 100ms, 200ms) for version error conflicts.
  - Transaction-session execution for moving items from wishlist to cart, with non-transaction fallback support.
  - Flagging invalid cart items dynamically on GET queries without silent document deletion.
  - Structured invalidation reason enums (`UNPUBLISHED`, `ARCHIVED`, `OUT_OF_STOCK`, `PRICE_CHANGED`) and `hasInvalidItems` flag.
  - Swagger endpoint specifications and request examples.
  - Implementation contracts (`docs/cart-checkout-contract.md`) and state lifecycles.

- **Wishlist Domain (Phase 4.1):**
  - Unique `Wishlist` schema storing user-linked bookmark references array.
  - Dedicated `WishlistRepository` supporting atomic array modifications (`$addToSet`, `$pull`, `$set`).
  - Centralized `WishlistMapper` mapping product details, stock statuses, categories, and added dates to lightweight DTOs.
  - `WishlistService` logic managing a strict maximum cap of 200 wishlist items.
  - Endpoint check helper `GET /api/v1/wishlist/check/:productId` to instantly determine wishlist state.
  - RESTful `DELETE /api/v1/wishlist` to clear entire collections of wishlisted items.
  - Swagger annotations for all GET, POST, and DELETE endpoints.
  - Verification test specs and schema lifecycle documentation (`docs/database/wishlist-domain.md`, `docs/api/wishlist-api.md`, `docs/architecture/wishlist-lifecycle.md`, `docs/wishlist-future-roadmap.md`).
  - Enforced `maxTimeMS(2000)` timeouts on all database discovery/lookups.

- **Product Discovery Domain (Phase 3.5):**
  - Unified product lookup endpoint `GET /api/v1/products` containing search, filters, sorting, and pagination.
  - Decoupled `ProductQueryBuilder` doing parse → normalize → validate query structures.
  - Dedicated `ProductRepository` and `InventoryRepository` isolating schemas.
  - Lean `ProductCardDTO` projection minimizing output payloads.
  - Standardized all sort query keys to snake_case (`price_asc`, `name_desc`, etc.).
  - Detailed search guide `docs/search-performance.md` covering query execution optimization.
