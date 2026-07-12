# Checkout Domain — Database Design

## Collection Schema: `checkoutsessions`

Tracks transient status validations and cart/address snapshots during payment operations.

### MongoDB Document Representation
```javascript
{
  "_id": ObjectId("65f8a0b0d3e5b3001f349d20"),
  "userId": ObjectId("65f8a0b0d3e5b3001f349a15"),
  "cartId": ObjectId("65f8a0b0d3e5b3001f349c20"),
  "status": "RESERVED",
  "reservationId": "checkout:reservation:65f8a0b0d3e5b3001f349d20",
  "reservationExpiresAt": ISODate("2026-07-12T11:45:00.000Z"),
  "validatedAt": ISODate("2026-07-12T11:30:00.000Z"),
  "cartSnapshot": {
    "items": [
      {
        "productId": ObjectId("65f8a0b0d3e5b3001f349a2a"),
        "quantity": 2,
        "price": 4500,
        "name": "Merino Wool Beanie",
        "image": "https://res.cloudinary.com/...",
        "slug": "merino-wool-beanie"
      }
    ]
  },
  "shippingAddressSnapshot": {
    "street": "123 Wooly Lane",
    "city": "Knit Town",
    "state": "Fabric State",
    "postalCode": "12345",
    "country": "Craftland"
  },
  "idempotencyKey": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "paymentProvider": "stripe",
  "paymentIntentId": "pi_3M7e2C2eZvKYlo2C01j2f4K2",
  "extensionCount": 0,
  "createdAt": ISODate("2026-07-12T11:30:00.000Z"),
  "updatedAt": ISODate("2026-07-12T11:30:05.000Z"),
  "__v": 1
}
```

### Schema Mappings & Attributes

| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Auto-generated | Document unique identifier |
| `userId` | `ObjectId` | Required | References `users._id` |
| `cartId` | `ObjectId` | Required | References `carts._id` |
| `status` | `String` | Enum | Valid states: `CREATED`, `VALIDATING`, `READY`, `PAYMENT_PENDING`, `EXPIRED`, `CANCELLED`, `FAILED`, `COMPLETED` |
| `reservationId` | `String` | Optional | Maps to the Redis lock key |
| `reservationExpiresAt`| `Date` | Optional | Expiration deadline for Redis stock locks |
| `validatedAt` | `Date` | Optional | Timestamp when verification rules passed |
| `cartSnapshot` | `Object` | Required | Holds validated cart items list |
| `shippingAddressSnapshot`| `Object` | Optional | Frozen shipping details |
| `idempotencyKey` | `String` | Required | Prevents duplicate payments processing |
| `paymentProvider` | `String` | Enum | `stripe`, `razorpay`, or `cod` |
| `paymentIntentId` | `String` | Optional | Transaction ID reference |
| `extensionCount` | `Number` | Default: 0 | Number of +5 min extensions applied (max 3) |

---

## Indexes

### 1. User Status Index (`user_status_index`)
```javascript
db.checkoutsessions.createIndex(
  { userId: 1, status: 1 },
  { name: "user_status_index" }
);
```
- **Purpose:** Optimizes queries fetching active checkouts (`GET /current`) and validates duplicates.

### 2. Time-To-Live Expiration Sweep Index (`session_ttl_index`)
```javascript
db.checkoutsessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 900, name: "session_ttl_index" }
);
```
- **Purpose:** Automatically removes checkout session documents from the collection after 15 minutes of inactivity.
