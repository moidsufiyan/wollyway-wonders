# Checkout to Order — Integration Contract

This document defines the strict parameter mappings handed to the Order service upon a successful checkout transaction.

---

## 1. Trigger Hook (Handshake Action)

Upon receiving a payment gateway capture confirmation:
1. `checkoutService` transitions status to `COMPLETED`.
2. It triggers `orderService.createOrder(payload)` using the verified snapshots.
3. It calls `cartService.clearCart(userId)` to empty the user's shopping cart list.

---

## 2. Parameter Mapping Interface

The parameters sent to the Order creation service are fully projected from the `CheckoutSession` snapshot records to prevent future profile mutations from altering completed legal receipts.

| CheckoutSession Source Field | Order Target Field | Type | Description |
|---|---|---|---|
| `userId` | `userId` | `ObjectId` | Customer account owner reference |
| `cartSnapshot.items` | `items` | `Array` | Snapshot list of items bought |
| `cartSnapshot.items[i].productId` | `items[i].productId`| `ObjectId` | Product reference |
| `cartSnapshot.items[i].name` | `items[i].name` | `String` | Frozen product name on receipt |
| `cartSnapshot.items[i].price` | `items[i].price` | `Number` | Price charged per unit (cents) |
| `cartSnapshot.items[i].quantity` | `items[i].quantity` | `Number` | Quantity purchased |
| `shippingAddressSnapshot` | `shippingAddress` | `Object` | Frozen shipping address |
| `paymentProvider` | `paymentInfo.provider`| `String` | Gateway provider used (e.g. `stripe`) |
| `paymentIntentId` | `paymentInfo.transactionId`| `String` | Transaction Reference |
| `totals.subtotal` | `subtotal` | `Number` | Invoiced item subtotal |
| `totals.shippingFee` | `shippingFee` | `Number` | Shipping fee charged |
| `totals.taxTotal` | `taxTotal` | `Number` | Invoiced tax fee |
| `totals.orderTotal` | `orderTotal` | `Number` | Total payment amount captured |

---

## 3. Post-Condition Stock Deductions

Once `orderService.createOrder` successfully completes:
- The Checkout coordinator issues a database inventory reduction to the `InventoryRepository`:
  ```typescript
  await inventoryRepository.deductInventory(productId, quantity);
  ```
- This permanently decrements MongoDB stock pool counters and clears the session's short-term Redis lock allocations.
