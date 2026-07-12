# Cart Lifecycle — Architecture & State Transitions

This document details the lifecycle stages of the shopping cart session list inside the WollyWay platform.

---

## 1. Lifecycle Diagram

```mermaid
stateDiagram-v2
    [*] --> Unsaved : Guest browsing (Must authenticate)
    Unsaved --> EmptyCart : User Auth/Registration
    
    state AuthenticatedCart {
        [*] --> EmptyCart
        EmptyCart --> ItemsAdded : POST /items (validate stock & visibility)
        ItemsAdded --> QuantityUpdated : PATCH /items/:id (validate max limit & stock)
        ItemsAdded --> ItemsRemoved : DELETE /items/:id
        ItemsAdded --> EmptyCart : DELETE / (Clear Cart)
    }

    ItemsAdded --> CheckoutPending : Proceed to Checkout (Initialize Session)
    CheckoutPending --> OrderCreated : Stripe Payment Captures Successfully (Clear Cart)
    CheckoutPending --> ItemsAdded : Payment Fails or Session Expires (Stock Released)
```

---

## 2. Dynamic Status Mapping (GET non-mutating validation)

Instead of silently updating database documents during read queries, the Cart domain maps invalid states dynamically to the client:

```mermaid
flowchart TD
    A[Query DB Cart Document] --> B[Batch fetch Product & Stock details]
    B --> C{Product exists & published?}
    C -->|No| D[Mark isValid: false, reason: UNPUBLISHED/ARCHIVED]
    C -->|Yes| E{Quantity > stockAvailable?}
    E -->|Yes| F[Mark isValid: false, reason: OUT_OF_STOCK]
    E -->|No| G{PriceSnapshot != currentPrice?}
    G -->|Yes| H[Mark isValid: true, reason: PRICE_CHANGED]
    G -->|No| I[Mark isValid: true]
```

- Invalid items (marked `isValid: false`) are **excluded** from derived totals calculations.
- Mismatched prices (marked `priceChanged: true`) are flagged to prompt user updates before initiating checkout.

---

## 3. Concurrency Protection (Version Retries)

When concurrent quantity modifications are executed on the same cart document:

```
Process A: Reads Cart (v1)  ──────► Modifies Array ──────► Saves (Success, v2)
Process B: Reads Cart (v1)  ──────► Modifies Array ──────► Version Conflict Error (Retries)
                                                                 │
                                                                 ▼
                                                        Re-reads Cart (v2)
                                                                 │
                                                                 ▼
                                                       Checks stock constraints
                                                                 │
                                                                 ▼
                                                        Saves (Success, v3)
```

- Exponential backoff delays: Attempt 1 = 50ms delay, Attempt 2 = 100ms delay, Attempt 3 = 200ms delay.
- The service throws a `409 Conflict` error to the client only if all 4 attempts fail version verification checks.
