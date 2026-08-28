# WollyWay — Complete Project Handoff Document
> **For:** Seamless continuation in a new IDE session  
> **Last Verified:** 2026-08-19  
> **Current Git Status:** All Phase 4.1–4.3 committed and clean

---

## 1. What Is WollyWay?

WollyWay is a **production-grade, single-vendor handcrafted e-commerce platform** for selling knitted/woollen products (beanies, scarves, blankets, etc.).

**This is NOT a tutorial project.** It is engineered to pass a professional code review inside a real software company.

Key facts:
- **Single vendor** — one seller, many customers. No multi-seller marketplace logic.
- **Handcrafted products** — small catalog (~100–500 items). Offset pagination, not cursor.
- **Target market** — India. Prices stored in **paisa** (₹1 = 100 paisa). Payment via Razorpay or Stripe.
- **Authentication-first** — no guest carts, no public wishlists, no anonymous sessions.

---

## 2. Workspace Path

```
c:\Users\Moid Sufiyan\OneDrive - Vardhaman College of Engineering\Documents\MyWorkspace\Wollyway
```
Backend lives at: `<workspace>/backend`

---

## 3. Technology Stack

### Frontend (workspace root — largely deprioritized, backend-first)
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| State | Zustand |
| Data Fetching | React Query (TanStack Query) |
| Package Manager | Bun |

### Backend (`/backend` directory)
| Layer | Technology |
|---|---|
| Runtime | Node.js + Express |
| Language | TypeScript — **ESM modules (`.js` imports always)** |
| Database | MongoDB + Mongoose |
| Cache / Locking | Redis (ioredis) |
| Media | Cloudinary (signed uploads + magic number validation) |
| Auth | JWT access tokens + Refresh Token Rotation (httpOnly cookies) |
| Validation | Zod |
| API Docs | Swagger/OpenAPI (swagger-jsdoc + swagger-ui-express) |
| Logging | Pino + pino-http (structured JSON logs) |
| Linting | ESLint (strict: no-explicit-any, no-unused-vars) |
| Formatting | Prettier |
| Containerization | Docker |
| CI/CD | GitHub Actions |

---

## 4. Architecture Pattern — MANDATORY, NEVER VIOLATE

```
HTTP Request
     ↓
Controller       ← Thin. Reads req, calls service, sends response. ZERO business logic.
     ↓
Service          ← ALL business logic lives here. Orchestrates calls.
     ↓
Builders/Mappers ← Query builders (ProductQueryBuilder), DTO mappers (WishlistMapper, CartMapper)
     ↓
Repository       ← MongoDB-only layer. No business logic. Returns raw Mongoose docs.
     ↓
MongoDB / Redis
```

### Hard Rules — Every one of these is non-negotiable:
1. Repositories NEVER contain business logic. They only talk to MongoDB.
2. Controllers NEVER contain business logic. They are route handlers only.
3. Mongoose documents are NEVER sent to the client. Always convert via Mappers/DTOs.
4. All route files have Swagger JSDoc annotations.
5. All write endpoints have Zod validation via `validate(schema)` middleware.
6. Every authenticated route uses the `protect` middleware.
7. `AppError` is always used for thrown errors: `throw new AppError(message, HTTP_STATUS.XXX)`
8. TypeScript imports use `.js` extension: `import { X } from '../models/user.model.js'`
9. No `export default class` — use `export class X {}` then `export const x = new X()` at bottom of file.
10. No `catch (error: any)` — always `catch (error: unknown)` with proper type narrowing.
11. Pino logger: `req.log?.error(...)` inside request scope, `logger.error(...)` at module scope.
12. Never store derived values — subtotals/totals computed dynamically on read.
13. Run `npm run format` → `npm run lint` → `npm run build` before every commit.

---

## 5. The Implementation Workflow (How Every Domain Was Built)

Every single domain followed this exact sequence. The new session should follow the same pattern.

```
Step 1:  Architecture Blueprint
         → AI produces a comprehensive design document before any code
         → Covers: schema design, service responsibilities, endpoint list,
           Redis strategy, edge cases, business rules, concurrency handling

Step 2:  User Review of Blueprint
         → User reads it, proposes improvements, corrections, and additions
         → AI incorporates all feedback

Step 3:  Implementation Plan
         → After blueprint is agreed, AI creates an ordered file-by-file build plan

Step 4:  File-by-File Implementation
         → model → types → validator → repository → service → mapper → controller → routes
         → Docs written alongside: database schema doc, API reference, lifecycle doc

Step 5:  Lint + Build Verification
         → `npm run lint` (must show 0 errors)
         → `npm run build` (must compile clean)

Step 6:  Git Commit
         → Conventional commits: `feat(domain): description`
         → Example: `feat(checkout): implement checkout domain orchestration and redis stock locks`

Step 7:  Contracts & Integrations
         → Write inter-domain contracts (e.g. cart-checkout-contract.md, checkout-order-contract.md)
         → Update cross-domain-interaction-matrix.md
```

---

## 6. Complete File Inventory

### `/backend/src/models/`
| File | Domain |
|---|---|
| `user.model.ts` | Auth/User |
| `category.model.ts` | Category |
| `product.model.ts` | Product |
| `inventory.model.ts` | Inventory |
| `inventory-transaction.model.ts` | Inventory audit log |
| `wishlist.model.ts` | Wishlist |
| `cart.model.ts` | Cart |
| `checkout-session.model.ts` | Checkout |

### `/backend/src/services/`
| File | Domain |
|---|---|
| `cloudinary.service.ts` | Media |
| `inventory.service.ts` | Inventory |
| `product.service.ts` | Product |
| `wishlist.service.ts` | Wishlist |
| `cart.service.ts` | Cart |
| `checkout.service.ts` | Checkout (largest, ~16KB) |

### `/backend/src/controllers/`
| File | Domain |
|---|---|
| `health.controller.ts` | Health check |
| `auth.controller.ts` | Auth |
| `user.controller.ts` | User |
| `category.controller.ts` | Category |
| `inventory.controller.ts` | Inventory |
| `product.controller.ts` | Product |
| `wishlist.controller.ts` | Wishlist |
| `cart.controller.ts` | Cart |
| `checkout.controller.ts` | Checkout |

### `/backend/src/repositories/`
| File | Domain |
|---|---|
| `product.repository.ts` | Product |
| `inventory.repository.ts` | Inventory |
| `wishlist.repository.ts` | Wishlist |
| `cart.repository.ts` | Cart |
| `checkout.repository.ts` | Checkout |

### `/backend/src/routes/`
| File | Domain |
|---|---|
| `health.routes.ts`, `auth.routes.ts`, `user.routes.ts` | Core |
| `category.routes.ts`, `inventory.routes.ts`, `product.routes.ts` | Catalog |
| `wishlist.routes.ts`, `cart.routes.ts`, `checkout.routes.ts` | Customer Loop |

### `/backend/src/mappers/`
| File | Domain |
|---|---|
| `product.mapper.ts` | Product |
| `wishlist.mapper.ts` | Wishlist |
| `cart.mapper.ts` + `cart-item.mapper.ts` | Cart |

### `/backend/src/types/`
| File | Domain |
|---|---|
| `express.d.ts` | Express type augmentation (adds `req.user`) |
| `discovery.types.ts` | Product discovery (filters, sort, pagination) |
| `wishlist.types.ts` | Wishlist DTOs |
| `cart.types.ts` | Cart DTOs (CartDTO, CartItemDTO, CartTotalsDTO, InvalidationReason) |
| `checkout.types.ts` | Checkout DTOs (CheckoutStatus, CheckoutSummaryDTO, etc.) |

### `/backend/src/validators/`
| File |
|---|
| `auth.validator.ts`, `user.validator.ts`, `category.validator.ts` |
| `inventory.validator.ts`, `product.validator.ts`, `wishlist.validator.ts` |
| `cart.validator.ts`, `checkout.validator.ts` |

### `/backend/src/middlewares/`
| File | Purpose |
|---|---|
| `auth.middleware.ts` | `protect` (JWT verify) + `restrictTo(role)` |
| `validate.ts` | Zod schema validation middleware |
| `errorHandler.ts` | Global error boundary + notFoundHandler |
| `rateLimiter.middleware.ts` | express-rate-limit global limiter |
| `upload.middleware.ts` | Multer + magic number validation for Cloudinary |
| `requestId.middleware.ts` | Correlation ID injection |

### `/backend/src/builders/`
| File | Purpose |
|---|---|
| `product.query-builder.ts` | Builds MongoDB filter/sort/pagination from URL params |

### `/backend/src/constants/index.ts` (all exported constants)
```typescript
HTTP_STATUS         // { OK: 200, CREATED: 201, ... }
USER_ROLES          // { ADMIN: 'admin', CUSTOMER: 'customer' }
COOKIE_KEYS         // { REFRESH_TOKEN: 'wollyway_refresh' }
REDIS_KEYS          // { ACTIVE_REFRESH_TOKEN, CATALOG_CACHE, INVENTORY_RESERVATION }
MESSAGES            // { VALIDATION_ERROR, UNAUTHORIZED, ... }
API                 // { PREFIX: '/api', VERSION: 'v1' }
COOKIES             // { REFRESH_TOKEN: 'wollyway_refresh' }
MAX_FEATURED_CATEGORIES = 6
RESERVATION_TIMEOUT_MINUTES = 15
MAX_CART_ITEM_QUANTITY = 10
```

### `/backend/docs/` (documentation tree)
```
docs/
├── api/
│   ├── cart-api.md
│   ├── checkout-api.md
│   ├── product-api.md
│   └── wishlist-api.md
├── architecture/
│   ├── cart-lifecycle.md
│   ├── checkout-lifecycle.md
│   ├── cross-domain-interaction-matrix.md   ← Critical for future domains
│   ├── inventory-lifecycle.md
│   ├── product-lifecycle.md
│   └── wishlist-lifecycle.md
├── database/
│   └── [per-domain schema docs]
├── business-rules.md                        ← All hard business rules
├── cart-checkout-contract.md
├── checkout-order-contract.md               ← ORDER DOMAIN MUST READ THIS
├── search-performance.md
└── wishlist-future-roadmap.md
```

---

## 7. Completed Domains — Key Implementation Decisions

### ✅ Phase 1 — Authentication
- POST /api/v1/auth/register, /login, /logout, /refresh
- Refresh Token Rotation: SHA-256 hashed, stored in Redis with userId key
- Brute-force lockout: 5 failed attempts = 15-minute lockout
- httpOnly cookie `wollyway_refresh` for refresh tokens

### ✅ Phase 2 — User Domain
- GET/PATCH /api/v1/users/me
- Address CRUD: /users/me/addresses, /users/me/addresses/:addressId
- PII scrubbing on deactivation (name, email, phone wiped, status → `deactivated`)
- No public profile URLs

### ✅ Phase 3.1 — Category Domain
- Full CRUD, nested hierarchy support
- MAX_FEATURED_CATEGORIES = 6 (enforced at service layer)
- Archive lock: cannot archive if active products exist
- Slug immutability after creation (SEO protection)
- Status: `active` | `hidden` | `archived`

### ✅ Phase 3.2 — Inventory Domain
- One inventory document per product (auto-created when product is created)
- Cannot be manually created via API
- `trackInventory: false` flag bypasses ALL stock checks (custom handcrafted items)
- Public API returns labels only (`"In Stock"`, `"Only 3 left"`) — never raw counts
- Admin API returns raw counts
- Append-only audit log via `inventory-transaction.model.ts`
- `sold` counter only updated on payment success (not during checkout)

### ✅ Phase 3.3 — Product Domain
- Publishing guard: cannot go `draft → published` without `price`, `categoryId`, and exactly 1 `isPrimary: true` image
- Slug immutability after `published` state
- Tag normalization: lowercase, trimmed, deduplicated, max 15
- Max 10 images, max file size 5MB
- Archive cascade safeguard: cannot archive if unsettled orders pending

### ✅ Phase 3.4 — Cloudinary Media
- Magic number byte validation before upload (blocks spoofed file extensions)
- Signed uploads via Cloudinary SDK
- Images linked to product document

### ✅ Phase 3.5 — Product Discovery
- GET /api/v1/products?q=&category=&sort=&page=&limit=
- `ProductQueryBuilder` decouples filter/sort/pagination construction from service
- `ProductCardDTO` is a lean projection — only what UI needs
- Sort keys are snake_case: `price_asc`, `price_desc`, `name_asc`, `name_desc`, `newest`
- Offset pagination (page + limit)

### ✅ Phase 4.1 — Wishlist Domain
- One wishlist document per user
- Max 200 items (enforced in WishlistService)
- Idempotent add (`$addToSet`)
- `GET /api/v1/wishlist/check/:productId` → `{ wishlisted: true/false }` — used for heart icon state without downloading the whole list
- `DELETE /api/v1/wishlist` — clears entire wishlist
- All MongoDB queries have `.maxTimeMS(2000)` timeout

### ✅ Phase 4.2 — Cart Domain
- Schema: `cart.model.ts` — unique index `{ userId: 1 }`, compound index `{ userId: 1, "items.productId": 1 }`
- `cartRepository.upsertCart()` uses `findOneAndUpdate` with `$setOnInsert` for atomic creation
- Subtotal is ALWAYS derived dynamically on read — never stored in DB
- MAX_CART_ITEM_QUANTITY = 10 (per item)
- Cart total cap = 200,000 paisa (₹2,000) enforced at service
- On add/update: existing + new → validate → reject if exceeds stock (no silent clamping)
- Invalid items flagged on GET with `InvalidationReason`: `UNPUBLISHED | ARCHIVED | OUT_OF_STOCK | PRICE_CHANGED`
- `hasInvalidItems` flag on CartTotalsDTO
- Concurrency version retry: exponential backoff 50ms → 100ms → 200ms, max 3 attempts
- Move from wishlist to cart: runs in MongoDB transaction session; non-transaction fallback if replica set unavailable
- Cart NEVER reserves stock — that is exclusively the Checkout domain's responsibility

**Cart Routes:**
```
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/:productId
DELETE /api/v1/cart/items/:productId
DELETE /api/v1/cart
POST   /api/v1/cart/items/move-from-wishlist
```

### ✅ Phase 4.3 — Checkout Domain
- Schema: `checkout-session.model.ts` — compound index `{ userId: 1, status: 1 }`, TTL index 900 seconds
- **Status state machine:** `CREATED → VALIDATING → READY → RESERVED → PAYMENT_PENDING → COMPLETED / FAILED / EXPIRED / CANCELLED`
- **PAYMENT_PENDING** state was added after initial design — bridges gap between reservation and payment confirmation

**Validation Pipeline (sequential, any failure aborts):**
1. Auth check (user exists, not deactivated)
2. Cart validation (not empty, items exist)
3. Product status check (all items still published)
4. Live price comparison (ignores cart's priceSnapshot, fetches directly from DB)
5. Address completeness check (shipping address must be complete)
6. Stock availability check (live stock − Redis reserved counts)
7. Atomic Redis reservation via Lua script

**Redis Keys:**
```
checkout:reservation:{checkoutSessionId}    ← Per-session lock (hash of items)
checkout:reserved-count:{productId}         ← Per-product reserved counter
idempotency:checkout:{idempotencyKey}       ← 120s idempotency cache for confirmations
```

**Key Design Decisions:**
- Lua scripts do a dry-run check atomically before any Redis writes — prevents overselling
- cartSnapshot is a unified object (not split priceSnapshot[] + inventorySnapshot[]) — reused for Order, Invoice, Email, Audit
- shippingAddressSnapshot is a frozen copy of address at checkout time — immune to future profile changes
- `POST /checkout/extend` → +5 min, max 3 extensions (tracked via `extensionCount` field)
- Stock is NEVER decremented in MongoDB during checkout — only permanently deducted on payment success
- Boot reconciliation: `checkoutService.reconcileStaleSessions()` runs on server startup

**Checkout Routes:**
```
POST   /api/v1/checkout/start
GET    /api/v1/checkout/current
POST   /api/v1/checkout/confirm
POST   /api/v1/checkout/cancel
POST   /api/v1/checkout/extend
```

---

## 8. Cross-Domain Interaction Matrix

| Target Domain | Cart Reads | Cart Writes | Checkout Reads | Checkout Writes | Notes |
|---|---|---|---|---|---|
| **Cart** | self | self | ✓ (reads) | ✓ (clears on success) | Checkout has read-only access; Cart never triggers Checkout |
| **Inventory** | ✓ (reads stock labels) | ✗ | ✓ (reads raw counts) | ✓ (locks in Redis) | Cart reads only; Checkout manages all reservations |
| **User** | ✗ | ✗ | ✓ (reads address) | ✗ | Checkout verifies address; never mutates user |
| **Products** | ✓ (reads status/price) | ✗ | ✓ (live price fetch) | ✗ | Checkout ignores cart's priceSnapshot |
| **Orders** (future) | ✗ | ✗ | ✗ | ✓ (creates on payment) | Cart does not participate in order creation |
| **Payments** (future) | ✗ | ✗ | ✗ | ✓ (webhook confirms) | Decoupled via webhooks |
| **Wishlist** | ✗ | ✓ (removes on move) | ✗ | ✗ | Cart controller orchestrates the move |

---

## 9. Key Business Rules (from `docs/business-rules.md`)

- Password: min 8 chars, must have uppercase + lowercase + number + special char
- Brute-force: 5 failed logins = 15-min lockout
- Deactivation: status → `deactivated`, PII wiped, transaction records preserved
- Categories: max 6 featured, archive lock, slug immutable
- Inventory: `available ≥ 0`, `reserved ≥ 0` always; `trackInventory: false` bypasses all checks
- Products: publishing guard, slug frozen after publish, max 10 images, max 15 tags
- Archive cascade: product cannot archive if unsettled orders exist
- Inventory sold counter: read-only, only updated on payment success
- Reservations: expire after `RESERVATION_TIMEOUT_MINUTES` (15 min)

---

## 10. Key DTOs for Reference

### CartItemDTO (how cart items arrive at the client)
```typescript
interface CartItemDTO {
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  priceSnapshot: number;      // Price when added to cart
  currentPrice: number;       // Live price from DB
  priceDiff: number;          // currentPrice - priceSnapshot
  primaryImage: { url, alt, width, height } | null;
  category: { name, categorySlug } | null;
  availability: { status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK', label, maxAvailable };
  isValid: boolean;
  validationReason?: 'UNPUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK' | 'PRICE_CHANGED';
  addedAt: Date;
}
```

### CheckoutSummaryDTO
```typescript
interface CheckoutSummaryDTO {
  sessionId: string;
  items: { productId, name, price, quantity, image, slug, isAvailable }[];
  shippingAddressSnapshot: { street, city, state, postalCode, country } | null;
  totals: { subtotal, shippingFee, taxTotal, orderTotal };
  reservationExpiresAt: Date | null;
  status: CheckoutStatus;
  paymentProvider: 'stripe' | 'razorpay' | 'cod' | null;
  paymentIntentId: string | null;
}
```

### CheckoutItemSnapshot (frozen in MongoDB)
```typescript
interface CheckoutItemSnapshot {
  productId: Types.ObjectId;
  quantity: number;
  price: number;    // In paisa
  name: string;
  image: string;
  slug: string;
}
```

---

## 11. NEXT: Phase 4.4 — Order Domain

**Start by requesting an Architecture Blueprint from the AI before writing any code.**

### What we know from the Checkout → Order contract (`docs/checkout-order-contract.md`):

**Trigger:** Payment gateway capture confirmation received by Checkout domain.

**Sequence:**
1. `checkoutService` transitions session status → `COMPLETED`
2. It calls `orderService.createOrder(payload)` using verified snapshots from CheckoutSession
3. It calls `cartService.clearCart(userId)` to empty the cart
4. It calls `inventoryRepository.deductInventory(productId, quantity)` to permanently deduct stock and release Redis locks

**Order document must contain (from contract):**

| CheckoutSession Source | Order Field | Type |
|---|---|---|
| `userId` | `userId` | ObjectId |
| `cartSnapshot.items` | `items` | Array |
| `cartSnapshot.items[i].productId` | `items[i].productId` | ObjectId |
| `cartSnapshot.items[i].name` | `items[i].name` | String (frozen) |
| `cartSnapshot.items[i].price` | `items[i].price` | Number (paisa) |
| `cartSnapshot.items[i].quantity` | `items[i].quantity` | Number |
| `shippingAddressSnapshot` | `shippingAddress` | Object (frozen) |
| `paymentProvider` | `paymentInfo.provider` | String |
| `paymentIntentId` | `paymentInfo.transactionId` | String |
| `totals.subtotal` | `subtotal` | Number |
| `totals.shippingFee` | `shippingFee` | Number |
| `totals.taxTotal` | `taxTotal` | Number |
| `totals.orderTotal` | `orderTotal` | Number |

**Expected Order status lifecycle:**
`pending → confirmed → shipped → delivered → cancelled / refunded`

**Files to create (following existing patterns):**
- `models/order.model.ts`
- `types/order.types.ts`
- `validators/order.validator.ts`
- `repositories/order.repository.ts`
- `services/order.service.ts`
- `mappers/order.mapper.ts`
- `controllers/order.controller.ts`
- `routes/order.routes.ts`
- `docs/api/order-api.md`
- `docs/architecture/order-lifecycle.md`
- `docs/database/order-domain.md`

---

## 12. After Order: Phase 4.5 — Payment Integration

- Webhook endpoint: `POST /api/v1/payments/webhook`
- Signature verification (Razorpay: HMAC-SHA256, Stripe: `stripe.webhooks.constructEvent`)
- On capture confirmed: triggers CheckoutSession → COMPLETED → Order creation

---

## 13. Backend npm Scripts (run from `/backend`)

```bash
npm run dev      # ts-node-dev watch
npm run build    # tsc → dist/
npm run lint     # ESLint (must show 0 errors before commit)
npm run format   # Prettier
```
