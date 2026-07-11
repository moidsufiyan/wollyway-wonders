# Database Architecture: Category Domain

This document describes the database design, validation constraints, relations, and business logic rules of the Category domain.

---

## 1. Schema Specifications

### Category Document (`categories` collection)
```typescript
{
  _id: ObjectId,
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true, trim: true },
  image: {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
    alt: { type: String, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null }
  },
  status: { type: String, enum: ['active', 'hidden', 'archived'], default: 'active' },
  sortOrder: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  seo: {
    title: { type: String, default: null },
    description: { type: String, default: null },
    keywords: [{ type: String }],
    canonicalUrl: { type: String, default: null }
  },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  archivedAt: { type: Date, default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 2. Relationships Mapping

* **Product $\rightarrow$ Category (1:N Parent-Referencing)**:
  * Products hold a `categoryId` reference pointing to the Categories collection.
  * Storing product lists inside the Category document is avoided to prevent document size exhaustion (16MB MongoDB limit) and query slowdowns as catalog inventories grow.

---

## 3. Database Indexes

1. **Unique Index on `slug`**:
   `db.categories.createIndex({ slug: 1 }, { unique: true })`
   * *Purpose*: Speeds up O(1) primary key routing lookups when retrieving categories by URL.
2. **Compound Index on `status` and `sortOrder`**:
   `db.categories.createIndex({ status: 1, sortOrder: 1 })`
   * *Purpose*: Optimizes queries rendering active menus and sorting categories on the client.
