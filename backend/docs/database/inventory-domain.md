# Database Architecture: Inventory Domain

This document describes the database design, validation constraints, relations, and business logic rules of the Inventory domain.

---

## 1. Schema Specifications

### Inventory Document (`inventories` collection)
```typescript
{
  _id: ObjectId,
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true, index: true },
  available: { type: Number, required: true, min: 0, default: 0 },
  reserved: { type: Number, required: true, min: 0, default: 0 },
  sold: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, required: true, min: 0, default: 5 },
  trackInventory: { type: Boolean, default: true },
  isDiscontinued: { type: Boolean, default: false },
  archivedAt: { type: Date, default: null },
  createdAt: Date,
  updatedAt: Date
}
```

### Derived Availability Status (Computed State)
To avoid dual sources of truth, the stock status is computed on retrieval instead of stored:
```typescript
let status: 'discontinued' | 'out-of-stock' | 'low-stock' | 'in-stock';

if (inventory.isDiscontinued) {
  status = 'discontinued';
} else if (inventory.available === 0) {
  status = 'out-of-stock';
} else if (inventory.available <= inventory.lowStockThreshold) {
  status = 'low-stock';
} else {
  status = 'in-stock';
}
```

### Inventory Transaction History Document (`inventory_transactions` collection)
An append-only collection tracking every stock adjustment:
```typescript
{
  _id: ObjectId,
  inventoryId: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true, index: true },
  reason: { type: String, enum: ['manual', 'purchase', 'return', 'damage', 'audit', 'correction', 'shrinkage'], required: true },
  quantity: { type: Number, required: true }, // positive for increments, negative for decrements
  before: { type: Number, required: true }, // stock level before change
  after: { type: Number, required: true }, // stock level after change
  notes: { type: String, default: null }, // optional context notes
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: Date
}
```

---

## 2. Relationships Mapping

* **Product $\leftrightarrow$ Inventory (1:1 Parent-Referencing)**:
  * Inventory contains a unique `productId` link.
  * Keeping these separate limits write lock contention to the small inventory record.

---

## 3. Database Indexes

1. **Unique Index on `productId`**:
   `db.inventories.createIndex({ productId: 1 }, { unique: true })`
   * *Purpose*: Speeds up O(1) query lookups when linking products with their stock.
2. **Compound Index on `{ available: 1, isDiscontinued: 1 }`**:
   `db.inventories.createIndex({ available: 1, isDiscontinued: 1 })`
   * *Purpose*: Speeds up catalog queries checking for in-stock and active listings.
