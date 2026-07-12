# Wishlist API

All endpoints require JWT authorization (Authorization: Bearer <Token>).

---

### `GET /api/v1/wishlist`
Retrieves the user's wishlist page.

- **Query Parameters:**
  - `page` (number, default: 1, min: 1)
  - `limit` (number, default: 20, min: 1, max: 50)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 1,
      "totalItems": 1
    },
    "products": [
      {
        "productId": "65f8a0b0d3e5b3001f349a2a",
        "name": "Merino Wool Beanie",
        "slug": "merino-wool-beanie",
        "price": 4500,
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
          "label": "In Stock"
        },
        "addedAt": "2026-07-12T11:00:00.000Z"
      }
    ]
  }
  ```

---

### `GET /api/v1/wishlist/check/:productId`
Instantly checks if a product is wishlisted by the authenticated user. Used by the frontend to fill/empty heart icons without downloading the full product list.

- **Path Parameters:**
  - `productId` (string, required) — 24-character hex ObjectId.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "wishlisted": true
  }
  ```

---

### `POST /api/v1/wishlist`
Adds a product to the user's wishlist. If the item already exists, this operation is idempotent and returns success without adding duplicates.

- **Request Body:**
  ```json
  {
    "productId": "65f8a0b0d3e5b3001f349a2a"
  }
  ```
- **Response `201 Created` / `200 OK`** (returns page 1 of the wishlist):
  *(Same shape as `GET /api/v1/wishlist`)*
- **Errors:**
  - `400 Bad Request` — Wishlist has reached size cap (200 items).
  - `404 Not Found` — Product does not exist or visibility is not `published`.

---

### `DELETE /api/v1/wishlist/:productId`
Removes a product from the user's wishlist. If the item is not in the wishlist, returns success (idempotent).

- **Path Parameters:**
  - `productId` (string, required) — 24-character hex ObjectId.
- **Response `200 OK`** (returns page 1 of the updated wishlist):
  *(Same shape as `GET /api/v1/wishlist`)*

---

### `DELETE /api/v1/wishlist`
Clears the entire wishlist.

- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalPages": 0,
      "totalItems": 0
    },
    "products": []
  }
  ```
