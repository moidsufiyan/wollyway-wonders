# Cart Domain — Database Design

## Collection Schema: `carts`

Manages customer shopping session lists with dynamic price validation properties.

### MongoDB Document Representation
```javascript
{
  "_id": ObjectId("65f8a0b0d3e5b3001f349c20"),
  "userId": ObjectId("65f8a0b0d3e5b3001f349a15"),
  "items": [
    {
      "productId": ObjectId("65f8a0b0d3e5b3001f349a2a"),
      "quantity": 2,
      "priceSnapshot": 4500,
      "addedAt": ISODate("2026-07-12T11:00:00.000Z")
    }
  ],
  "createdAt": ISODate("2026-07-12T11:00:00.000Z"),
  "updatedAt": ISODate("2026-07-12T11:15:00.000Z"),
  "__v": 3
}
```

### Schema Mappings & Attributes

| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Auto-generated | Document unique identifier |
| `userId` | `ObjectId` | Unique, Required | References `users._id`. Matches exactly one cart per customer. |
| `items` | `Array` | Defaults `[]` | List of items selected for purchase |
| `items.productId` | `ObjectId` | Required | References `products._id` |
| `items.quantity` | `Number` | Min: 1 | Quantity requested. Must not exceed stock levels or MAX_CART_ITEM_QUANTITY. |
| `items.priceSnapshot` | `Number` | Min: 0 | Frozen product price at addition time (in cents) |
| `items.addedAt` | `Date` | Defaults `Date.now` | Timestamp when item entered the cart |
| `createdAt` | `Date` | Auto-managed | Document creation timestamp |
| `updatedAt` | `Date` | Auto-managed | Document modification timestamp |

---

## Indexes

We establish the following index pattern:

### 1. Unique User Index (`userId_unique`)
```javascript
db.carts.createIndex(
  { userId: 1 },
  { unique: true, name: "userId_unique" }
);
```
- **Purpose:** Optimizes user queries (every cart fetch lookup runs here). Enforces database-level constraint: exactly **one** cart document per user account.

### 2. Compound Item Lookup Index (`user_product_lookup`)
```javascript
db.carts.createIndex(
  { userId: 1, "items.productId": 1 },
  { name: "user_product_lookup" }
);
```
- **Purpose:** Optimizes positional array updates (e.g. updating quantity of an item already in the cart) by bypassing full array sweeps.
