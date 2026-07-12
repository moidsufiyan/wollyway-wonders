# Checkout API

All endpoints require JWT authorization (Authorization: Bearer <Token>).

---

### `POST /api/v1/checkout/start`
Validates the user's cart, shipping address, and item prices. If successful, creates a checkout session and reserves stock in Redis.

- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "checkout": {
      "sessionId": "65f8a0b0d3e5b3001f349d20",
      "items": [
        {
          "productId": "65f8a0b0d3e5b3001f349a2a",
          "name": "Merino Wool Beanie",
          "price": 4500,
          "quantity": 2,
          "image": "https://res.cloudinary.com/...",
          "slug": "merino-wool-beanie",
          "isAvailable": true
        }
      ],
      "shippingAddressSnapshot": {
        "street": "123 Wooly Lane",
        "city": "Knit Town",
        "state": "Fabric State",
        "postalCode": "12345",
        "country": "Craftland"
      },
      "totals": {
        "subtotal": 9000,
        "shippingFee": 500,
        "taxTotal": 720,
        "orderTotal": 10220
      },
      "reservationExpiresAt": "2026-07-12T11:45:00.000Z",
      "status": "RESERVED",
      "paymentProvider": null,
      "paymentIntentId": null
    }
  }
  ```
- **Errors:**
  - `409 Conflict` — Mismatch detected in product prices, stock level availability, or visibility conditions.

---

### `GET /api/v1/checkout/current`
Retrieves the user's active checkout session (status READY or RESERVED).

- **Response `200 OK`**:
  *(Returns the CheckoutSummaryDTO envelope)*
- **Errors:**
  - `404 Not Found` — No active checkout session exists.

---

### `POST /api/v1/checkout/confirm`
Locks the session under `PAYMENT_PENDING` status to start payment capture. Requires `Idempotency-Key` header.

- **Headers:**
  - `Idempotency-Key` (string, required) — unique request UUID key.
- **Request Body:**
  ```json
  {
    "paymentProvider": "stripe"
  }
  ```
- **Response `200 OK`**:
  *(Returns the updated CheckoutSummaryDTO envelope)*
- **Errors:**
  - `409 Conflict` — Idempotency lock is active or request is currently processing.

---

### `POST /api/v1/checkout/extend`
Extends the stock reservation and session validity by 5 minutes.

- **Response `200 OK`**:
  *(Returns updated CheckoutSummaryDTO with updated `reservationExpiresAt`)*
- **Errors:**
  - `400 Bad Request` — Maximum extension limits reached (3 max).

---

### `POST /api/v1/checkout/cancel`
Cancels checkout and releases Redis stock locks immediately.

- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Checkout cancelled and stock locks released."
  }
  ```
