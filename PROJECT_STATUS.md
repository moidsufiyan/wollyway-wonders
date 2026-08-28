# WollyWay — Project Status Tracker

## Platform Milestones

### Core Framework & Foundation
- [x] Next.js Migration (Next.js 15 Migration)
- [x] Express Backend Base Structure & Middlewares
- [x] Authentication & Session Management (JWT, Refresh Tokens)
- [x] User Domain Management (Customer Profile, Address verification)

### Phase 3: Catalog & Content
- [x] Category Domain (Hierarchical layout, active/hidden status)
- [x] Inventory Domain (Lock reservation hooks, thresholds)
- [x] Product Domain (Draft drafts, validation guards, images)
- [x] Cloudinary Media Management (Signed streams, magic number checking)
- [x] Product Discovery Domain (Offset pagination, Query Builder, ProductCardDTO, text index lookup)

### Phase 4: Customer Loop
- [x] Wishlist Domain (v1 Core, cap constraints, idempotent APIs, Check status)
- [x] Cart Domain (Atomic upserts, dynamic subtotal, exponential backoff version retry)
- [x] Checkout Domain (Price locking, tax calculations, stock locks, idempotency)
- [x] Order Domain (ACID transaction commit, immutable snapshots, fulfillment state machine, IDOR protection, idempotent restocking)
- [x] Phase 4.5A — Payment Integration: Razorpay (HMAC verified capture webhooks, intent reuse, multi-factor reconciliation)
- [ ] Phase 4.5B — Payment Integration: Stripe (Deferred plugin)
