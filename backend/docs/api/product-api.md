# Product Domain API

## Public Endpoints (Unauthenticated)

### `GET /api/v1/products/featured`
Returns products marked as `featured: true` and `visibility: published`. Powers the homepage grid instantly without manual filtering overhead.

### `GET /api/v1/products`
Retrieves paginated, filtered, and sorted products.
*   **Query Params**: 
    *   `page`, `limit`
    *   `categoryId`
    *   `tags` (comma separated)
    *   `sort` (e.g. `price`, `-price`, `createdAt`)
*   **Returns**: Only `visibility: published` items.

### `GET /api/v1/products/:slug`
Fetches a single product by its SEO-friendly `slug`.
*   **Returns**: 404 if not found or if archived. (Returns 200 if hidden but explicitly requested via slug).

### `GET /api/v1/products/search`
Executes native MongoDB `$text` search against the indexed text weights.
*   **Query Params**: `q` (string search term)

---

## Admin Endpoints (Requires JWT + Admin Role)

### `POST /api/v1/products`
Creates a new Product in `draft` state.
*   **Body**: Requires `name` and `slug`.
*   **Side-effect**: Triggers the Inventory domain to instantiate a linked stock tracker at `available: 0`.

### `PATCH /api/v1/products/:id`
Updates product fields. Transitions states (e.g. `visibility: published`).
*   **Validation**: Enforces discount constraints (`salePrice` < `price`), tag normalization, and exactly one primary image guard if publishing.

### `DELETE /api/v1/products/:id`
Soft-deletes the product.
*   **Side-effect**: Transitions visibility to `archived` and sets `archivedAt` timestamp. Fails if unsettled orders exist.

### `POST /api/v1/products/:id/images`
Attaches a new image object array payload to the product.

### `DELETE /api/v1/products/:id/images/:publicId`
Removes an image reference from the product array.
