# Product Domain API

## Public Endpoints (Unauthenticated)

### `GET /api/v1/products/featured`
Returns products marked as `featured: true` and `visibility: published`. Powers the homepage carousel without manual filtering overhead.

---

### `GET /api/v1/products` — Product Discovery
Unified discovery endpoint. Supports full-text keyword search, faceted filtering, sorting, and offset pagination via a reusable Query Builder.

**Example:**
```
GET /api/v1/products?q=wool&categorySlug=winter&page=1&limit=12
GET /api/v1/products?availability=in_stock&sort=price_asc&maxPrice=5000
GET /api/v1/products?featured=true&limit=6
```

**Query Parameters:**

| Parameter | Type | Default | Rules |
|---|---|---|---|
| `q` | `string` | — | Max 100 chars. Full-text search on name, tags, materials, description. |
| `categorySlug` | `string` | — | Category slug (not ObjectId). |
| `minPrice` | `number` | — | Non-negative. Must be ≤ maxPrice. |
| `maxPrice` | `number` | — | Non-negative. Must be ≥ minPrice. |
| `tags` | `string` | — | Comma-separated. Max 10. Normalized: lowercase, trimmed, unique. |
| `materials` | `string` | — | Comma-separated. Normalized: lowercase, trimmed, unique. |
| `availability` | `in_stock` \| `all` | `in_stock` | `in_stock` shows only products with inventory.available > 0. |
| `featured` | `boolean` | — | Filter to featured products only. |
| `sort` | `string` | `newest` | `relevance` \| `newest` \| `price_asc` \| `price_desc` \| `name_asc` \| `name_desc` \| `featured` |
| `page` | `integer` | `1` | Min: 1. |
| `limit` | `integer` | `12` | Min: 1, Max: 50. |

**Notes:**
- Unknown parameters are silently ignored.
- `sort=relevance` requires a `q` value; falls back to `newest` if not provided.
- `sort=featured` sorts by `featured DESC, createdAt DESC` for predictable ordering.

**Response:**
```json
{
  "success": true,
  "results": 12,
  "query": { "q": "wool" },
  "pagination": { "page": 1, "limit": 12, "totalPages": 4, "totalItems": 47 },
  "filters": { "categorySlug": "winter", "availability": "in_stock" },
  "sort": "newest",
  "products": [
    {
      "_id": "...",
      "name": "Merino Wool Beanie",
      "slug": "merino-wool-beanie",
      "price": 4500,
      "primaryImage": { "url": "...", "alt": "...", "width": 800, "height": 800 },
      "featured": true,
      "category": { "_id": "...", "name": "Winter Accessories", "slug": "winter-accessories" },
      "availability": { "status": "IN_STOCK", "label": "In Stock" }
    }
  ]
}
```

---

### `GET /api/v1/products/:slug`
Fetches a single full product by its SEO-friendly `slug`. Used for the Product Detail Page.
- Returns `404` if not found or archived.
- Returns `200` for `hidden` products if slug is known (direct link sharing).

---

## Admin Endpoints (Requires JWT + Admin Role)

### `POST /api/v1/products`
Creates a new Product in `draft` state.
- **Body**: Requires `name` and `slug`.
- **Side-effect**: Triggers the Inventory domain to instantiate a linked stock tracker at `available: 0`.

### `PATCH /api/v1/products/:id`
Updates product fields. Transitions states (e.g. `visibility: published`).
- **Validation**: Enforces discount constraints (`salePrice` < `price`), tag normalization, and exactly one primary image guard if publishing.

### `DELETE /api/v1/products/:id`
Soft-deletes the product.
- **Side-effect**: Transitions visibility to `archived` and sets `archivedAt` timestamp. Fails if unsettled orders exist.

### `POST /api/v1/products/:id/images`
Uploads new images to Cloudinary and attaches them to the product. Max 10 images total per product.

### `PUT /api/v1/products/:id/images/:publicId`
Replaces a specific image (identified by Cloudinary publicId) with a new upload.

### `DELETE /api/v1/products/:id/images/:publicId`
Removes an image reference from the product and deletes the asset from Cloudinary.

---

## Removed Endpoints

### ~~`GET /api/v1/products/search`~~ (Removed in Phase 3.5)
This endpoint was removed. Keyword search is now handled by `GET /api/v1/products?q=...`.
No frontend consumers existed at time of removal (verified via full codebase search).
