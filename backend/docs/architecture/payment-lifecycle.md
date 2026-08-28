# Architecture: Payment Integration & Webhook Lifecycle

This document describes the complete flow from checkout initiation to verified webhook capture and order commitment.

---

## 1. Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as Next.js Client
    participant PaymentController
    participant PaymentService
    participant RazorpayAdapter
    participant Razorpay as Razorpay Gateway
    participant OrderService
    participant DB as MongoDB (Replica Set)
    participant Redis as Redis Cache

    Customer->>Frontend: Click "Proceed to Pay"
    Frontend->>PaymentController: POST /api/v1/payments/create-intent { provider: "razorpay" }
    PaymentController->>PaymentService: createPaymentIntent(userId, "razorpay")
    PaymentService->>PaymentService: Verify active session & frozen totals
    alt Active intent already exists on session
        PaymentService-->>Frontend: Reuse existing gateway order_id
    else New intent required
        PaymentService->>RazorpayAdapter: createPaymentIntent({ amount, currency, ... })
        RazorpayAdapter->>Razorpay: orders.create(...)
        Razorpay-->>RazorpayAdapter: { id: "order_xxxx", ... }
        PaymentService->>DB: Update CheckoutSession (status: PAYMENT_PENDING, paymentIntentId)
        PaymentService-->>Frontend: { provider, clientReference: "order_xxxx", amount, keyId }
    end

    Frontend->>Customer: Render Razorpay Checkout Modal
    Customer->>Razorpay: Authorize UPI / Netbanking / Card
    Razorpay-->>Customer: Payment Successful

    Note over Razorpay,PaymentController: Server-to-Server Asynchronous Handshake
    Razorpay->>PaymentController: POST /api/v1/payments/webhook/razorpay (rawBody, x-razorpay-signature)
    PaymentController->>PaymentService: handleWebhook("razorpay", rawBody, signature)
    PaymentService->>RazorpayAdapter: verifyWebhookSignature(rawBody, signature)
    RazorpayAdapter-->>PaymentService: true (HMAC timingSafeEqual valid)
    PaymentService->>RazorpayAdapter: normalizeWebhookEvent(rawBody, headers)
    
    PaymentService->>DB: Atomic Claim Event (unique index on { eventId, provider })
    alt Duplicate Event Collision (E11000)
        PaymentService-->>PaymentController: 200 OK { status: 'already_processed' }
        PaymentController-->>Razorpay: 200 OK
    else Claim Succeeded (PROCESSING)
        PaymentService->>PaymentService: Reconcile amount & currency against CheckoutSession
        PaymentService->>OrderService: createOrderFromCheckout(sessionId, confirmationPayload)
        
        activate OrderService
        OrderService->>DB: MongoDB ACID Transaction (Order, Stock, Audit, Checkout, Cart)
        OrderService->>Redis: Release Reservation Lock (Lua Script)
        OrderService-->>PaymentService: Order created (CONFIRMED)
        deactivate OrderService

        PaymentService->>DB: Update PaymentWebhookEvent (status: PROCESSED)
        PaymentService-->>PaymentController: 200 OK { status: 'PROCESSED', orderId, orderNumber }
        PaymentController-->>Razorpay: 200 OK
    end
```

---

## 2. Invariants & Security Boundaries

1. **Client Untrusted:** Frontend redirects and client-provided transaction IDs are untrusted. Orders are created exclusively upon server-side webhook verification.
2. **Provider Agnosticism:** `OrderService` has no dependency on Razorpay or gateway SDKs; it accepts only `PaymentConfirmationPayload`.
3. **Atomic Claiming:** Concurrent webhook deliveries hit MongoDB's unique index on `{ eventId: 1, provider: 1 }` and are absorbed immediately.
4. **Frozen Snapshot Reconciliation:** The webhook capture amount is strictly compared to `subtotal + shippingFee + taxTotal` from the frozen `CheckoutSession` snapshot, preventing dynamic price manipulation.
5. **No Premature Processed State:** `PaymentWebhookEvent.status` transitions to `PROCESSED` **only after** `OrderService.createOrderFromCheckout()` completes successfully.
