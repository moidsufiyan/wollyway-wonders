# API Reference: Payment Domain (Phase 4.5A — Razorpay)

This document describes all payment endpoints for client checkout initiation and payment gateway webhook ingestion.

---

## 1. Customer Endpoints

### `POST /api/v1/payments/create-intent`
Initializes or reuses a payment intent with the chosen provider for the authenticated customer's active checkout session.

* **Headers:** `Authorization: Bearer <customer_token>`
* **Request Body:**
```json
{
  "provider": "razorpay"
}
```
* **Validation:** Zod schema strictly validates `provider` (`'razorpay' | 'stripe'`). Clients cannot provide arbitrary amounts, currencies, or session IDs.
* **Idempotency Behavior:** If the active checkout session already contains an active `paymentIntentId` for the requested provider, the backend reuses it rather than generating redundant gateway orders.
* **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "provider": "razorpay",
    "clientReference": "order_NYa8912hjk12",
    "amount": 269892,
    "currency": "INR",
    "keyId": "rzp_test_xxxxxx"
  }
}
```

---

## 2. Gateway Webhook Endpoints

### `POST /api/v1/payments/webhook/razorpay`
Authoritative server-side payment capture receiver for Razorpay.

* **Security:** Public endpoint secured by cryptographic HMAC SHA256 signature verification (`x-razorpay-signature`) using `crypto.timingSafeEqual`.
* **Headers Required:**
  - `x-razorpay-signature`: Hex-encoded HMAC SHA256 digest calculated over the raw request byte stream.
  - `x-razorpay-event-id` (optional): Unique event ID from Razorpay.
* **Response Semantics:**
  - **`200 OK` `{ status: 'PROCESSED', message: 'Order created successfully', orderId, orderNumber }`:** Valid capture; order created via ACID transaction.
  - **`200 OK` `{ status: 'DUPLICATE', message: 'Webhook event already processed' }`:** Replay or concurrent delivery safely absorbed without duplicate order creation or duplicate stock deduction.
  - **`200 OK` `{ status: 'IGNORED', message: '...' }`:** Non-capture event (e.g. `payment.failed`, unsupported event) acknowledged cleanly without creating an order.
  - **`400 Bad Request`:** Permanent business mismatch (amount/currency mismatch against frozen checkout session, missing session).
  - **`401 Unauthorized`:** Cryptographic signature mismatch.
  - **`500 Internal Server Error`:** Transient database or infrastructure error; event is marked retryable so Razorpay's exponential retry can re-attempt.

---

## 3. Stripe Status (Phase 4.5B)
Stripe webhook endpoints (`/webhook/stripe`) and client intents are cleanly abstracted under `IPaymentProvider` and will be enabled in Phase 4.5B.
