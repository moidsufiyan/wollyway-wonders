# Database Architecture: User Domain

This document describes the database design, validation constraints, relations, and business logic rules of the User domain.

---

## 1. Schema Specifications

### User Document (`users` collection)
```typescript
{
  _id: ObjectId,
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  avatar: {
    url: { type: String, default: null },
    publicId: { type: String, default: null }
  },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  status: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
  phone: { type: String, default: null, trim: true },
  addresses: [AddressSubSchema],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  cart: [CartItemSubSchema],
  preferences: {
    newsletter: { type: Boolean, default: false },
    marketingEmails: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'INR' }
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: null, select: false },
  emailVerificationExpires: { type: Date, default: null, select: false },
  passwordResetToken: { type: String, default: null, select: false },
  passwordResetExpires: { type: Date, default: null, select: false },
  lastLoginAt: { type: Date, default: null },
  passwordChangedAt: { type: Date, default: null },
  createdAt: Date,
  updatedAt: Date
}
```

### Address Subdocument Schema (`AddressSubSchema`)
```typescript
{
  _id: ObjectId,
  label: { type: String, enum: ['Home', 'Work', 'Office', 'Other'], default: 'Home' },
  customLabel: { type: String, default: null, trim: true }, // Used if label is 'Other'
  streetAddress: { type: String, required: true, trim: true },
  apartmentSuite: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, default: 'India' },
  phone: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false }
}
```

### Cart Item Subdocument Schema (`CartItemSubSchema`)
```typescript
{
  _id: false,
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 }
}
```

---

## 2. Business and Soft Limit Rules

1. **Address Book Limits**: Maximum of `5` saved addresses per user. Attempts to add more will return a validation error.
2. **Avatar constraints**: Maximum file size of `2 MB`. Restricted to `JPEG`, `PNG`, and `WEBP` formats.
3. **Wishlist soft limits**: Maximum of `100` saved products inside the wishlist array.
4. **Anonymization during Deactivation**: When a user requests account deletion, the system:
   * Sets status to `deactivated`.
   * Anonymizes fields (scans and overwrites name to `"Deactivated User"`, email to `deactivated_${userId}@wollyway.com`, phone to `null`, addresses array to `[]`).
   * Retains the primary document structure and historical order records to maintain accounting data consistency.
5. **No Public Slugs**: User profile endpoints require valid session validation. No public routes (e.g. `/users/:slug`) exist.

---

## 3. Relationships Mapping

* **Embedded Relations (1:N and 1:1)**:
  * `addresses` and `cart` are embedded inside the User document. Since address lists and active shopping carts are small (typically < 5 items), this layout achieves fast, atomic updates.
* **Referenced Relations (N:M and 1:N)**:
  * `wishlist` and `orders` use referenced relationships (`ObjectId` arrays or fields) pointing to separate collections to prevent User documents from approaching MongoDB's 16MB document size limit as history scales.

---

## 4. 🧠 Architecture & Interview Q&A

### Q1: Why embed addresses instead of using a separate database collection?
* **Answer**: Embedding addresses is highly optimized because a customer's address book is small (limited to 5 addresses in our system). Putting them in a separate collection would force an expensive `$lookup` (JOIN) command on every profile retrieval or checkout page load. Embedding ensures that the user profile, address book, preferences, and cart load in a single read.

### Q2: Why is the shopping cart embedded inside the User document?
* **Answer**: Embedding the cart allows us to retrieve and mutate active cart states atomically. Since the cart needs to sync between frontend visits, storing it in the user document saves server roundtrips. When a user navigates to checkout, the backend reads the embedded cart array and converts it to a structured order document in one step.

### Q3: Why does the wishlist use references instead of embedded product subdocuments?
* **Answer**: Storing raw product data (names, prices, sizes) in the user document would create major synchronization issues. If an administrator edits a product's price or description, we would have to search and update the wishlist subdocuments of every single user saving that item. Storing just the `ObjectId` allows us to query the `products` collection dynamically for current information.

### Q4: What is the purpose of the `select: false` attribute on the password field?
* **Answer**: It prevents the password hash from accidentally being sent to the client. By default, running `User.find()` or `User.findById()` will completely exclude the password parameter. It can only be accessed when explicitly requested during authentication using `.select('+password')`.

### Q5: Why is Role-Based Access Control (RBAC) sufficient for WollyWay?
* **Answer**: WollyWay is a single-vendor store with only two primary actors: Customers (general buyers) and Admins (the vendor owner). There are no complex multi-tenant vendor operations or custom staff permissions, meaning a simple check like `restrictTo('admin')` covers our needs with zero overhead.

### Q6: Why do we use Mongoose pre-save middleware to enforce the default address constraint?
* **Answer**: Running this logic inside Mongoose middleware ensures data integrity regardless of which API endpoint or service method updates the address book. If a new address is flagged `isDefault = true`, the middleware resets all other entries to `isDefault = false` atomically before the data hits the database, preventing inconsistent split-default states.

### Q7: Why are ObjectIds preferable to sequential auto-incrementing numeric IDs?
* **Answer**: Auto-incrementing IDs (e.g., `1`, `2`, `3`) make it trivial for attackers to guess IDs and scrape data (known as ID harvesting). `ObjectId`s are 12-byte identifiers containing timestamps, machine IDs, and process IDs. They are globally unique, cannot be easily guessed, and can be generated client-side without coordinating with the database.
