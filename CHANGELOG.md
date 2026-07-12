# Changelog

All notable changes to the WollyWay platform will be documented in this file.

---

## [Unreleased]

### Added
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
