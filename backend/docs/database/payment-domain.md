# Database Architecture: Payment Domain

This document describes the schema design, indexing rationale, and operational retention policies for the Payment Domain.

---

## 1. Schema Overview

The payment integration layer records external gateway webhook events in the `payment_webhook_events` collection. 

Unlike core business entities (`orders`, `checkoutsessions`), this collection acts as an **audit and deduplication boundary**:
- Prevents concurrent duplicate webhook executions (race-safety).
- Retains an append-only delivery log of all incoming gateway notifications.
- Enables debugging of signature, amount, or currency reconciliation mismatches.

Permanent financial contracts and order payment states are held strictly on the `Order` model (`paymentInfo`).

---

## 2. Data Dictionary

### Collection: `payment_webhook_events`

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Yes | Primary document ID. |
| `eventId` | `String` | Yes | Unique event ID provided by the payment gateway (e.g. `x-razorpay-event-id` or derived composite key). |
| `provider` | `String` | Yes | Gateway provider (`'razorpay' \| 'stripe'`). |
| `eventType` | `String` | Yes | Raw event classification (e.g. `'payment.captured'`, `'order.paid'`, `'payment.failed'`). |
| `gatewayOrderId` | `String` | No | Associated gateway Order / PaymentIntent ID (e.g. `order_xxxx`). |
| `gatewayPaymentId`| `String` | No | Associated gateway transaction / charge ID (e.g. `pay_xxxx`). |
| `payloadSummary` | `Mixed` | Yes | Sanitized metadata snapshot (event type, amount, currency, success flag). |
| `status` | `String` | Yes | Processing status (`'RECEIVED'`, `'PROCESSING'`, `'PROCESSED'`, `'FAILED'`, `'IGNORED'`). |
| `errorMessage` | `String` | No | Description of rejection or processing failure. |
| `retryable` | `Boolean` | Yes | Whether a failed event may be re-claimed upon gateway retry (default: `false`). |
| `processedAt` | `Date` | No | Timestamp when the order was committed and the event marked `PROCESSED`. |
| `createdAt` / `updatedAt` | `Date` | Yes | Automatic Mongoose timestamps. |

---

## 3. Database Indexes

```typescript
// 1. Race-Safe Idempotency Index (Prevents duplicate processing across concurrent workers)
PaymentWebhookEventSchema.index({ eventId: 1, provider: 1 }, { unique: true });

// 2. Gateway Order Lookup Index (Sparse index for fast correlation)
PaymentWebhookEventSchema.index({ gatewayOrderId: 1 }, { sparse: true });

// 3. Operational Housekeeping TTL Index (90 days retention policy)
PaymentWebhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
```

### Operational Retention Policy Note
The 90-day TTL index is an operational housekeeping policy to keep collection size bounded, not a regulatory assumption. Permanent accounting and transaction histories are retained indefinitely on the `orders` collection.
