# Cart API

All endpoints require JWT authorization (Authorization: Bearer <Token>).

---

### `GET /api/v1/cart`
Retrieves the user's cart. Stock and current pricing metrics are resolved dynamically on read.

- **Response `200 OK`**:
  ```json
  {
    "_id": "65f8a0b0d3e5b3001f349c20",
    "userId": "65f8a0b0d3e5b3001f349a15",
    "items": [
      {
        "productId": "65f8a0b0d3e5b3001f349a2a",
        "name": "Merino Wool Beanie",
        "slug": "merino-wool-beanie",
        "quantity": 2,
        "priceSnapshot": 4500,
        "currentPrice": 4500,
        "priceDiff": 0,
        "primaryImage": {
          "url": "https://res.cloudinary.com/...",
          "alt": "Merino Wool Beanie",
          "width": 800,
          "height": 800
        },
        "category": {
          "name": "Winter Accessories",
          "categorySlug": "winter-accessories"
        },
        "availability": {
          "status": "IN_STOCK",
          "label": "In Stock",
          "maxAvailable": 15
        },
        "isValid": true,
        "addedAt": "2026-07-12T11:00:00.000Z"
      }
    ],
    "totals": {
      "subtotal": 9000,
      "itemCount": 2,
      "priceChanged": false,
      "hasInvalidItems": false,
      "exceedsMaxSubtotal": false
    },
    "updatedAt": "2026-07-12T11:15:00.000Z"
  }
  ```

---

### `POST /api/v1/cart/items`
Adds a product to the user's cart. If the item already exists, increments quantity.

- **Request Body:**
  ```json
  {
    "productId": "65f8a0b0d3e5b3001f349a2a",
    "quantity": 2
  }
  ```
- **Response `200 OK`**:
  *(Returns the full CartDTO envelope)*
- **Errors:**
  - `400 Bad Request` — Requested quantity exceeds available stock or MAX_CART_ITEM_QUANTITY. Cart caps (50 items) exceeded.
  - `404 Not Found` — Product does not exist or visibility is not `published`.

---

### `PATCH /api/v1/cart/items/:productId`
Updates the quantity of a specific cart item.

- **Path Parameters:**
  - `productId` (string, required) — 24-character hex ObjectId.
- **Request Body:**
  ```json
  {
    "quantity": 5
  }
  ```
- **Response `200 OK`**:
  *(Returns the full CartDTO envelope)*
- **Errors:**
  - `400 Bad Request` — Quantity exceeds available stock or MAX_CART_ITEM_QUANTITY.
  - `409 Conflict` — Concurrency version error (handled by retry backoffs, thrown after 3 retries).

---

### `DELETE /api/v1/cart/items/:productId`
Removes an item from the cart. Idempotent.

- **Path Parameters:**
  - `productId` (string, required) — 24-character hex ObjectId.
- **Response `200 OK`**:
  *(Returns the full CartDTO envelope)*

---

### `DELETE /api/v1/cart`
Clears all items in the cart.

- **Response `200 OK`**:
  *(Returns the empty CartDTO envelope)*

---

### `POST /api/v1/cart/items/move-from-wishlist`
Moves a wishlisted product to the cart. Executes atomically inside a database transaction session.

- **Request Body:**
  ```json
  {
    "productId": "65f8a0b0d3e5b3001f349a2a"
  }
  ```
- **Response `200 OK`**:
  *(Returns the full CartDTO envelope)*
- **Errors:**
  - `409 Conflict` — Transaction session rollback error.
