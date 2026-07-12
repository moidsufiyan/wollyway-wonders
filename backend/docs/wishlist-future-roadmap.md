# WollyWay — Wishlist Domain Future Roadmap (v2 & v3)

This document maps out scalability enhancements for the Wishlist Domain after the initial core features (v1) are implemented.

---

## 1. Move to Cart
- **Goal:** Enable customers to move wishlisted products directly into their shopping cart.
- **Ownership/Flow:** The orchestration resides entirely in the `CartService`. The flow is structured as:
  ```
  1. User triggers "Move to Cart" on frontend
  2. CartController calls CartService.moveToCart(userId, productId)
  3. CartService queries ProductRepository/Inventory to ensure item is in stock
  4. CartService calls CartRepository.addItem(userId, productId)
  5. CartService calls WishlistService.removeFromWishlist(userId, productId)
  ```
- **Benefit:** Keeping the orchestration in the Cart keeps the Wishlist Domain decoupled and independent of cart details.

---

## 2. Shared & Public Wishlists
- **Goal:** Allow users to share wishlists with friends, family, or public registries.
- **Database Additions:**
  ```javascript
  {
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
    shareToken: { type: String, default: null } // Cryptographic secure random string
  }
  ```
- **API Additions:**
  - `PATCH /api/v1/wishlist/visibility` -> Toggle private/public state. Generates a `shareToken` if made public.
  - `GET /api/v1/wishlist/shared/:shareToken` -> Unauthenticated endpoint allowing users to view a wishlist without logging in.

---

## 3. Notifications & Alert Triggers
Since wishlists are stored inside a dedicated collection referencing exact product IDs, they act as target trackers.

### Price Drop Alerts
- **Mechanism:** When an admin updates a product price down:
  1. Trigger an event: `product.price_dropped`.
  2. A background worker queries all wishlists containing this `productId`:
     ```javascript
     db.wishlists.find({ "items.productId": productId })
     ```
  3. Send an email notification to matched users: *"An item on your wishlist is on sale!"*

### Back-in-Stock / Restock Notifications
- **Mechanism:** When stock is replenished (`inventory.available > 0` transition):
  1. Trigger event: `product.restocked`.
  2. Background worker queries wishlists with this `productId`.
  3. Notify matched users who wishlisted the item: *"Your favorite item is back in stock!"*

---

## 4. Collaborative Wishlists
- **Goal:** Allow multiple users to add/remove items from a shared registry (e.g., weddings, gift lists).
- **Database Additions:**
  - Introduce a `collaborators` field containing an array of user IDs:
    ```javascript
    collaborators: [{ userId: ObjectId, permission: 'write' }]
    ```
  - Authorization middleware checks if `req.user._id` is either the owner (`userId`) or a collaborator before writing.
