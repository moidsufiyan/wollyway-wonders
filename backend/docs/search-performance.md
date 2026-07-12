# WollyWay — Search Performance Guide

## 1. Index Strategy

The discovery endpoint relies on two indexes working in tandem. Verify both exist with:

```bash
db.products.getIndexes()
```

### Text Index (Relevance & Keyword Search)
```javascript
db.products.createIndex(
  { name: 'text', tags: 'text', materials: 'text', shortDescription: 'text' },
  {
    weights: { name: 10, tags: 7, materials: 5, shortDescription: 1 },
    name: 'product_text_index'
  }
);
```

> **Weights are configuration-driven.** Change them in `product.model.ts` without touching business logic. After changing, you must drop and recreate the index (see Index Migration below).

### Core Discovery Index (Browsing/Filtering)
```javascript
db.products.createIndex(
  { visibility: 1, price: 1, createdAt: -1 },
  { name: 'product_discovery_core' }
);
```

Covers the most common browsing pattern: filter by `status=published`, sort by price or newest.

---

## 2. Using `explain()` to Diagnose Query Performance

Run `explain()` before shipping any new filter to ensure MongoDB is using your indexes.

### How to Run
```javascript
db.products
  .find({ visibility: 'published', categoryId: ObjectId('...'), price: { $lte: 10000 } })
  .sort({ createdAt: -1 })
  .explain('executionStats');
```

### What to Look For

| Field | Good Value | Warning Sign |
|---|---|---|
| `winningPlan.stage` | `IXSCAN` or `TEXT` | `COLLSCAN` = missing index |
| `totalDocsExamined` | Close to `totalDocsReturned` | High gap = index is inefficient |
| `executionTimeMillis` | < 20ms | > 100ms = investigate |

---

## 3. Critical Anti-Pattern: Regex Search

**Never use regex for product search:**

```javascript
// ❌ BAD — forces a full collection scan (COLLSCAN)
db.products.find({ name: { $regex: 'wool', $options: 'i' } });
```

Regex cannot use a standard B-tree index when the pattern doesn't start with a literal string prefix. It scans every document.

**Always use the text index:**

```javascript
// ✅ GOOD — uses the text index, scales efficiently, supports relevance scoring
db.products.find({ $text: { $search: 'wool' } });
```

---

## 4. Query Timeout Enforcement (`maxTimeMS`)

All discovery queries are executed with `.maxTimeMS(2000)` inside `ProductRepository`. This ensures:
- Queries that would scan too many documents fail fast (2 seconds)
- The API never hangs waiting for a slow database query
- Misbehaving queries are surfaced in MongoDB Atlas performance advisor

This is set in `src/repositories/product.repository.ts` — `findWithDiscovery()` and `countWithFilter()`.

---

## 5. Index Migration Checklist

Run this checklist every time text index weights change:

- [ ] Drop old text index: `db.products.dropIndex('product_text_index')`
- [ ] Restart the API server (triggers Mongoose index rebuild from schema)
- [ ] Verify index was recreated: `db.products.getIndexes()`
- [ ] Run `explain()` on a text query — confirm `stage: TEXT` (not `COLLSCAN`)
- [ ] Run `explain()` on a category browse — confirm `stage: IXSCAN`

---

## 6. Future: MongoDB Atlas Search Migration

When the product catalog grows beyond ~10,000 items or richer search features are needed (typo tolerance, synonyms, autocomplete), migrate the Query Builder internals to Atlas Search.

**v1 (current — MongoDB Text Index):**
```javascript
db.products.find({ $text: { $search: 'wool sweater' } });
```

**v2 (Atlas Search — Lucene):**
```javascript
db.products.aggregate([
  {
    $search: {
      index: 'product_search',
      text: {
        query: 'wool sweater',
        path: ['name', 'tags', 'materials', 'shortDescription'],
        fuzzy: { maxEdits: 1 } // typo tolerance
      }
    }
  }
]);
```

**Impact:** Zero changes to controllers, routes, or the frontend. Only `ProductQueryBuilder.buildFilter()` and `ProductRepository.findWithDiscovery()` change.

---

## 7. Pre-Production Checklist

- [ ] Both indexes confirmed on target collection (`db.products.getIndexes()`)
- [ ] `explain()` confirms `IXSCAN` on all core discovery queries
- [ ] All discovery queries enforce `maxTimeMS`
- [ ] `q` parameter validated to max 100 characters
- [ ] `limit` parameter validated to max 50
- [ ] `tags` parameter validated to max 10 values
