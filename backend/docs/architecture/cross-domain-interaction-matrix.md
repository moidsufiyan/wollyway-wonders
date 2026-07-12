# Cross-Domain Interaction Matrix (Cart & Checkout)

To prevent domains from accidentally becoming tightly coupled, this matrix defines exactly how the Cart and Checkout domains read, write, and trigger events/side effects across other domains.

## Interaction Matrix

| Target Domain | Reads | Writes | Events / Side Effects | Coupling Guard |
|---|---|---|---|---|
| **Cart** | ✓ | ✓ (Clears) | Reads quantities and prices; clears items upon checkout success. | Checkout has read-only access to Cart; Cart never triggers Checkout methods. |
| **Inventory** | ✓ | ✓ (Locks) | Reads stock levels to validate; creates a 15-minute lock on checkout initialization. | Cart only reads stock (no locks); Checkout handles reservations. |
| **User** | ✓ | ✗ | Reads customer profiles and shipping addresses. | Checkout verifies address; does not mutate user account properties. |
| **Products** | ✓ | ✗ | Reads live product titles, images, categories, and active base prices. | Checkout ignores Cart's `priceSnapshot` and fetches live prices directly. |
| **Orders** (Future) | ✗ | ✓ | Creates a permanent order document upon successful payment. | Cart does not participate in order creation. |
| **Payments** (Future)| ✗ | ✓ | Generates Stripe payment sessions and receives transaction webhooks. | Decoupled via webhooks; payments only verify checkout status. |
| **Wishlist** | ✗ | ✓ (Removes) | Pulls items from wishlist if the user moves them to the cart. | Cart controller orchestrates the move, keeping services decoupled. |
