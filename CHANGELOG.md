# Changelog

All notable changes to the WollyWay platform will be documented in this file.

---

## [Unreleased]

### Added
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
