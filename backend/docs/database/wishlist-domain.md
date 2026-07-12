# Wishlist Domain — Database Design

## Collection Schema: `wishlists`

Tracks a customer's wishlisted items using an embedded document array pattern.

### MongoDB Document Representation
```javascript
{
  "_id": ObjectId("65f8a0b0d3e5b3001f349a20"),
  "userId": ObjectId("65f8a0b0d3e5b3001f349a15"),
  "items": [
    {
      "productId": ObjectId("65f8a0b0d3e5b3001f349a2a"),
      "addedAt": ISODate("2026-07-12T11:00:00.000Z")
    }
  ],
  "createdAt": ISODate("2026-07-12T11:00:00.000Z"),
  "updatedAt": ISODate("2026-07-12T11:05:00.000Z"),
  "__v": 0
}
```

### Schema Mappings & Attributes

| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Auto-generated | Document unique identifier |
| `userId` | `ObjectId` | Unique, Required | References `users._id`. Matches exactly one wishlist document per customer. |
| `items` | `Array` | Defaults `[]` | List of wishlisted product references |
| `items.productId` | `ObjectId` | Required | References `products._id` |
| `items.addedAt` | `Date` | Defaults `Date.now` | Timestamp when user added item |
| `createdAt` | `Date` | Auto-managed | Document creation timestamp |
| `updatedAt` | `Date` | Auto-managed | Document modification timestamp |

---

## Indexes

We establish the following index pattern:

### 1. Unique User Reference (`userId_1`)
```javascript
db.wishlists.createIndex(
  { userId: 1 },
  { unique: true, name: "userId_unique" }
);
```
- **Purpose:** Optimizes user queries (every wishlist retrieval starts here). Enforces database-level constraint: exactly **one** wishlist document per user account.

---

## Cascading Archival purges (Offline cleanup script recommendation)

When products are archived (soft deleted) via the admin panel, we don't block operations. An offline background cron job should periodically sweep all user wishlists to purge archived `productId`s:

```javascript
db.wishlists.updateMany(
  {},
  { $pull: { items: { productId: { $in: archivedProductIds } } } }
);
```
In-app code filters out non-published items dynamically, but this sweep keeps document sizes compact over time.
