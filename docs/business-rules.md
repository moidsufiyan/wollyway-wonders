# WollyWay — Platform Business Rules & Constraints

This document lists the authoritative business constraints and validation rules enforced across the WollyWay platform.

---

## 1. Product Domain Rules
- **Visibility States:** `draft` (default on creation), `published`, `hidden`, and `archived`.
- **Slugs:** Must only contain lowercase alphanumeric characters and hyphens. Immutable once published to preserve SEO integrity.
- **Price Constraints:**
  - Base price must be a positive integer (stored in cents).
  - Discounted price (`salePrice`) must be strictly less than base price.
- **Tags & Materials Normalization:**
  - Always normalized to `lowercase`, `trimmed`, and `unique` (deduplicated).
  - Maximum tags: **15**.
  - Maximum tag length: **30 characters**.
- **Images Constraint:**
  - Maximum **10** images per product.
  - Published products must have **exactly one** primary image (`isPrimary: true`).
  - Drafts can have zero.
  - Maximum upload size: **5 MB** per image.

---

## 2. Wishlist Domain Rules
- **Authentication:** All mutation/view actions require valid JWT authentication.
- **Cap Constraints:** Maximum of **200 items** per user wishlist.
- **Visibility Boundaries:** Only `visibility: 'published'` products can be added. Adding hidden, draft, or archived products is rejected.
- **Duplicate Prevention:** A product can exist only once in a user's wishlist.
- **Idempotency:**
  - Adding a product already in the wishlist returns `200 OK` (success).
  - Removing a product not present in the wishlist returns `200 OK` (success).

---

## 3. Cart Domain Rules
- **Authentication:** Carts are strictly authenticated-only in V1.
- **Cap Constraints:** Maximum of **50 unique products** per user cart.
- **Item Limit (`MAX_CART_ITEM_QUANTITY`):** Quantity per item must not exceed **10 units** or available stock, whichever is lower.
- **Duplicate Adds:** Adding an existing item validates `existing + new <= stock` and `existing + new <= MAX_CART_ITEM_QUANTITY`. Overflows throw a `400 Bad Request`.
- **Subtotal Cap:** Maximum derived subtotal of **₹2,00,000** (20000000 cents) per cart.
- **Visibility Boundaries:** Only `visibility: 'published'` products can be added.
- **Price Snapshots:** Product price is snapshotted at addition. Mismatches are flagged to the client during query. Checkout revalidates live prices directly.
- **Non-mutating Reads:** Retrieval (`GET`) does not delete invalid database items. Items are flagged `isValid: false` in the DTO, and the user must explicitly remove them.

---

## 4. Media Management Rules
- **Allowed Formats:** Only `image/jpeg`, `image/png`, `image/webp` are permitted.
- **Signature Check:** Verified via magic numbers (file signature headers) to prevent execution scripts disguised as images.
