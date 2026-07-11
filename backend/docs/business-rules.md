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
