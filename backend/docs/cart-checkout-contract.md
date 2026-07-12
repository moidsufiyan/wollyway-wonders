# WollyWay — Cart & Checkout Handshake Contract

This contract defines the operational interface and state assumptions between the **Cart Domain** and the **Checkout Domain**.

---

## 1. Checkout Entry State

When initializing a checkout sequence via `POST /api/v1/checkout/initialize`:

### Input requirements:
The Checkout Service calls `cartService.getRawCart(userId)` to obtain the customer's shopping cart selection list.

### Price Verification Policy:
- The Checkout Service ignores the cart's `priceSnapshot` values.
- It queries `productRepository.getPricesAndStatus(productIds)` directly from the database to obtain live costs.
- If the live price differs from `priceSnapshot`, the checkout creation request is blocked. An error payload is returned listing mismatches:
  ```json
  {
    "error": "PRICE_MISMATCH",
    "details": {
      "productId": "65f8a0b0d3e5b3001f349a2a",
      "snapshotPrice": 4500,
      "currentPrice": 5000
    }
  }
  ```
  *UX Resolution:* The client must prompt the customer to accept the updated pricing, which calls the cart service to overwrite the stale price snapshot before checkout can re-initialize.

### Inventory Reservation Policy:
- The Checkout Service checks stock levels in the `InventoryRepository`.
- If requested item counts are available, the checkout creates an exclusive **inventory lock (reservation)** with a **15-minute Time-To-Live (TTL)**.
- If stock is insufficient, the checkout initialization fails, and the customer is prompted to adjust quantities.

---

## 2. Checkout Success State (Purchase Completed)

Upon successful payment capture (Stripe webhook or manual authorization success):

1. **Clear Cart Command:** The Checkout Service calls `cartService.clearWishlistOrCart(userId)` to empty the items array.
2. **Commit Inventory:** The Inventory reservation lock is converted into a permanent deduction (reducing stock counters, incrementing sales history log metrics).

---

## 3. Checkout Failure / Expiry State

If a checkout session is abandoned or expires after 15 minutes:

1. **Unwind Inventory Lock:** The Checkout Service triggers an automatic release of the inventory reservations, returning the items back to general inventory stock numbers.
2. **Cart Retention:** The user's Cart is **not** cleared. The items remain in their cart, allowing them to restart the checkout loop later.
