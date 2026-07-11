# WollyWay Core Business Rules

This document outlines the strict business logic rules, constraints, and validation boundaries of the WollyWay platform.

---

## 1. User & Authentication Rules
* **Password Policy**: Minimum 8 characters. Must contain at least one uppercase letter, one lowercase letter, one number, and one special character.
* **Brute-Force Lockout**: IP/email requests are capped at 5 failed login attempts. Upon reaching 5 failures, lock logins for 15 minutes.
* **Account Deactivation**: User account deletions set the status to `deactivated` and scrub personal data (PII) from the user document, while preserving transaction records and document structures for historical accounting purposes.
* **Profile Privacy**: Profile routes require active JWT validations. No public user URLs or public profiles will exist.

---

## 2. Category Domain Rules
* **Maximum Featured Categories**: To prevent homepage grid clutter, a maximum of `6` categories can be marked `featured: true` concurrently. This constant is defined in `MAX_FEATURED_CATEGORIES` inside the constants module.
* **Archive Lock**: A category cannot be archived if there are active products still linked to it. Products must be reassigned or archived first.
* **Slug Immutability**: Category slugs generated on creation are frozen. Renaming category display titles does not modify existing slugs to protect SEO index integrity.
* **Lifecycle Visibility**:
  * `active`: Visible in all UI menus and catalogs.
  * `hidden`: Removed from global lists and menus, but products remain accessible via direct paths.
  * `archived`: Soft-deleted, completely excluded from standard database queries.
* **Sorting default**: Sorted primarily by `sortOrder` ascending, and secondary sorted by `name` ascending on collisions.

---

## 3. Inventory Domain Rules
* **Creation Sequence Flow**: An Inventory record cannot exist without a valid referenced Product document. Creating a product automatically triggers inventory creation (available = 0) and links them (one inventory per product). Inventory cannot be created via manual endpoints.
* **Pool Constraints**: `available` and `reserved` counts can never be less than zero (`available >= 0`, `reserved >= 0`).
* **Archiving Cascading Check**: Before a product can be archived, its linked Inventory must satisfy:
  * `available` = 0
  * `reserved` = 0
  * `isDiscontinued` = true
* **Custom Orders Tracking Bypass**: Products flagged with `trackInventory = false` (e.g. custom handcrafted knitted items) bypass all stock locking, reservation, and count validations. Availability is always considered purchasable.
* **Append-Only Auditing**: Inventory transaction movement logs are strictly append-only. History entries cannot be modified or deleted.
* **Operational Data Isolation**: The public client-facing API must mask exact stock counts, returning friendly descriptions (e.g., `"In Stock"` or `"Only 3 left"`) to hide operational indicators. Only Admin APIs can access raw available quantities.
* **Sold Counter Lock**: The `sold` count is read-only for admins and is only updated automatically upon Checkout -> Payment Success confirmation.
* **Reservations Expiry**: Locked checkout stock reservations expire after `RESERVATION_TIMEOUT_MINUTES` and are automatically released back to the available pool.


