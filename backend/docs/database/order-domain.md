# Database Architecture: Order Domain

This document provides the complete data dictionary, indexing rationale, and historical snapshot guarantees for the WollyWay Order Domain.

---

## 1. Schema Overview

The `orders` collection represents the permanent legal, accounting, and operational record of a completed commercial transaction.

Unlike the short-lived `checkoutsessions` collection, `orders` documents are immutable with respect to historical purchase facts (items, prices, discounts, delivery addresses) and mutable only with respect to controlled fulfillment workflows (status, carrier tracking, cancellation metadata).

---

## 2. Data Dictionary

### Collection: `orders`

| Field | Type | Required | Immutable? | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Yes | Yes | Primary Mongo document key. |
| `orderNumber` | `String` | Yes | Yes | Public-facing human-readable reference (`WW-YYYYMMDD-XXXX`). Unique index. |
| `userId` | `ObjectId` | Yes | Yes | Reference to `users` collection. |
| `checkoutSessionId` | `ObjectId` | Yes | Yes | Reference to originating `checkoutsessions` document. Unique index. |
| `customerSnapshot` | `Subdocument` | Yes | Yes | Frozen customer contact (`name`, `email`, `phone`). |
| `shippingAddress` | `Subdocument` | Yes | Yes | Frozen destination (`street`, `city`, `state`, `postalCode`, `country`). |
| `items` | `[Subdocument]` | Yes | Yes | Array of purchased line items. |
| `items[i].productId` | `ObjectId` | Yes | Yes | Reference to `products` collection. |
| `items[i].name` | `String` | Yes | Yes | Frozen product name at time of purchase. |
| `items[i].slug` | `String` | Yes | Yes | Frozen product slug for client linking. |
| `items[i].image` | `String` | No | Yes | Primary product image thumbnail URL. |
| `items[i].price` | `Number` | Yes | Yes | Unit price charged in integer **paisa**. |
| `items[i].quantity` | `Number` | Yes | Yes | Number of units purchased (min: 1). |
| `financials.subtotal` | `Number` | Yes | Yes | Sum of line items in integer paisa. |
| `financials.shippingFee` | `Number` | Yes | Yes | Delivery fee in integer paisa. |
| `financials.taxTotal` | `Number` | Yes | Yes | Tax collected in integer paisa. |
| `financials.orderTotal` | `Number` | Yes | Yes | Invoiced total in integer paisa. |
| `financials.currency` | `String` | Yes | Yes | Currency code (default: `'INR'`). |
| `paymentInfo.provider` | `String` | Yes | Yes | Gateway provider (`'stripe' \| 'razorpay'`). |
| `paymentInfo.transactionId` | `String` | Yes | Yes | Gateway charge/payment ID. Unique sparse index. |
| `paymentInfo.status` | `String` | Yes | Conditional| Payment state (`'paid' \| 'refunded'`). |
| `paymentInfo.paidAt` | `Date` | Yes | Yes | Timestamp of verified payment capture. |
| `status` | `String` | Yes | Controlled | Fulfillment state (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`). |
| `fulfillment.carrier` | `String` | No | Controlled | Shipping carrier partner. |
| `fulfillment.trackingNumber` | `String` | No | Controlled | Shipment tracking code. |
| `fulfillment.shippedAt` | `Date` | No | Controlled | Dispatch timestamp. |
| `fulfillment.deliveredAt` | `Date` | No | Controlled | Delivery timestamp. |
| `cancellation.reason` | `String` | No | Controlled | Cancellation explanation. |
| `cancellation.cancelledAt` | `Date` | No | Controlled | Cancellation timestamp. |
| `cancellation.cancelledBy` | `ObjectId` | No | Controlled | User/Admin who cancelled the order. |
| `createdAt` / `updatedAt` | `Date` | Yes | Auto | Standard Mongoose timestamps. |

---

## 3. Database Indexes

```typescript
// 1. Customer order history sorted newest first
OrderSchema.index({ userId: 1, createdAt: -1 });

// 2. Unique public identifier lookup
OrderSchema.index({ orderNumber: 1 }, { unique: true });

// 3. Unique checkout session link for idempotency
OrderSchema.index({ checkoutSessionId: 1 }, { unique: true });

// 4. Unique sparse payment transaction ID for webhook idempotency
OrderSchema.index({ 'paymentInfo.transactionId': 1 }, { unique: true, sparse: true });

// 5. Admin filtering and status queries
OrderSchema.index({ status: 1, createdAt: -1 });

// 6. Active product order verification (for product archival guard)
OrderSchema.index({ 'items.productId': 1, status: 1 });
```
