# Checkout to Order — Integration Contract

This document defines the strict parameter mappings and transactional invariants handed to the Order service upon a verified payment capture confirmation.

---

## 1. Trigger Hook & Transaction Scope

Upon receiving a verified server-side payment capture confirmation (`stripe` or `razorpay`):
1. `orderService.createOrderFromCheckout(checkoutSessionId, paymentPayload)` is invoked within a **MongoDB Multi-Document ACID Transaction**.
2. **Inside Transaction:**
   - Validates session eligibility (must be active and non-terminal).
   - Generates unique order number (`WW-YYYYMMDD-XXXX`).
   - Creates the permanent `Order` document with frozen item and customer snapshots.
   - Calls `inventoryRepository.deductStock(productId, quantity, orderId, checkoutSessionId, session)`:
     - Tracked items: decrements `available`, increments `sold`, appends `reason: 'purchase'` transaction.
     - Untracked items: leaves `available` untouched, increments `sold`, appends `reason: 'purchase'` transaction.
   - Updates `CheckoutSession` status to `COMPLETED`.
   - Empties the user's shopping cart via `cartRepository.clear(userId, session)`.
3. **Post-Commit Action:**
   - Calls `checkoutService.releaseSessionLocks(checkoutSessionId, items)` to purge Redis reservation locks.

---

## 2. Parameter Mapping Interface

| CheckoutSession Source Field | Order Target Field | Type | Description |
|---|---|---|---|
| `userId` | `userId` | `ObjectId` | Customer account owner reference |
| `cartSnapshot.items` | `items` | `Array` | Snapshot list of items bought |
| `cartSnapshot.items[i].productId` | `items[i].productId`| `ObjectId` | Product reference |
| `cartSnapshot.items[i].name` | `items[i].name` | `String` | Frozen product name on receipt |
| `cartSnapshot.items[i].slug` | `items[i].slug` | `String` | Frozen product slug |
| `cartSnapshot.items[i].image` | `items[i].image` | `String` | Primary image thumbnail URL |
| `cartSnapshot.items[i].price` | `items[i].price` | `Number` | Price charged per unit (paisa) |
| `cartSnapshot.items[i].quantity` | `items[i].quantity` | `Number` | Quantity purchased |
| `shippingAddressSnapshot` | `shippingAddress` | `Object` | Frozen shipping address |
| `paymentPayload.provider` | `paymentInfo.provider`| `String` | Gateway provider (`'stripe' \| 'razorpay'`) |
| `paymentPayload.transactionId` | `paymentInfo.transactionId`| `String` | Gateway capture/charge ID |
| `paymentPayload.paidAt` | `paymentInfo.paidAt` | `Date` | Timestamp of payment capture |
| Calculated `subtotal` | `financials.subtotal` | `Number` | Sum of item lines (paisa) |
| Calculated `shippingFee` | `financials.shippingFee` | `Number` | Delivery fee charged (paisa) |
| Calculated `taxTotal` | `financials.taxTotal` | `Number` | Invoiced tax fee (paisa) |
| Calculated `orderTotal` | `financials.orderTotal` | `Number` | Total payment amount captured (paisa) |
| Fixed `'INR'` | `financials.currency` | `String` | Base currency code |

---

## 3. Idempotency Invariants

- Dual unique database indexes on `checkoutSessionId` and `paymentInfo.transactionId` guarantee that duplicate webhook deliveries or retry storms execute exactly once.
- Pre-flight lookup returns the existing Order DTO immediately on duplicate invocation.
