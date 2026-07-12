# Product Domain Database Specifications

The Product Domain is the central source of truth for the catalog identity of all items.

## Collection: `products`

### Responsibility
Stores business identity, visuals, financial baseline (prices in cents), physical attributes, handmade customization flags, taxonomy (tags/categories), and visibility lifecycle states.
**It does NOT store inventory stock levels or reviews.**

### Schema Structure
```typescript
interface IProduct {
  _id: ObjectId;
  name: string; // Min 3 chars, Max 100
  slug: string; // Unique URL identifier. Immutable after publish.
  shortDescription: string;
  description: string;
  categoryId: ObjectId; // Ref to Category
  
  price: number; // In cents/smallest currency unit
  salePrice?: number; // Must be < price
  
  images: {
    url: string;
    publicId: string;
    alt: string;
    width: number;
    height: number;
    isPrimary: boolean; // EXACTLY ONE true per published product
    displayOrder: number;
  }[];
  
  materials: string[];
  careInstructions?: string;
  dimensions?: { length: number; width: number; height: number; unit: 'cm' | 'in' };
  weight?: { value: number; unit: 'g' | 'kg' | 'oz' | 'lb' };
  
  isCustomizable: boolean;
  estimatedProductionDays?: number;
  
  tags: string[]; // Normalized: lowercase, trimmed, unique. Max 15.
  featured: boolean;
  visibility: 'draft' | 'published' | 'hidden' | 'archived';
  
  seo?: { title?: string; description?: string; keywords?: string[]; canonicalUrl?: string };
  
  createdBy?: ObjectId;
  updatedBy?: ObjectId;
  archivedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Indexes

#### 1. Unique Lookup
```javascript
{ slug: 1 } // UNIQUE
```
Used for resolving product details pages (`/products/chunky-scarf`).

#### 2. Native Text Search
```javascript
{ 
  name: 'text', 
  materials: 'text', 
  shortDescription: 'text', 
  tags: 'text' 
},
{
  weights: { name: 10, tags: 5, materials: 5, shortDescription: 1 }
}
```
Enables `$text` queries optimized for discovery keywords without full collection scans.

#### 3. Category & Visibility Optimization
```javascript
{ categoryId: 1, visibility: 1 }
```
Optimizes category grid rendering.

#### 4. Featured View Optimization
```javascript
{ visibility: 1, featured: -1 }
```
Powers the `/api/v1/products/featured` homepage endpoint.

#### 5. Multikey Tags Search
```javascript
{ tags: 1 }
```
Instantaneous tag filtering.

#### 6. Archive Exclusions
```javascript
{ _id: 1, visibility: 1 }
```
Safeguards direct lookups to ensure archived items aren't accidentally leaked to customers.
