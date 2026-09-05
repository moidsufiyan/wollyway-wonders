# API Reference: Order Domain

This document describes all customer and administrative endpoints for the WollyWay Order Domain.

---

## 1. Authentication & Security Policy

* **Customer Endpoints:** Require valid JWT Bearer authentication (`protect` middleware). Customers can only view and manage their own orders. Attempting to query an order belonging to another customer returns `404 Not Found` (strict IDOR protection).
* **Admin Endpoints:** Require valid JWT Bearer authentication with the `admin` role (`protect` + `restrictTo('admin')`).
* **Payment Provenance:** Order creation is triggered server-side by verified payment gateway confirmation payloads. Frontend-supplied confirmation data is never trusted directly.

---

## 2. Customer Endpoints

### `GET /api/v1/orders/me`
Retrieve paginated order history for the authenticated customer.

* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 50)
* **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "66c2d1e0f4a8b5001e123456",
      "orderNumber": "WW-20260819-7F3A",
      "status": "CONFIRMED",
      "itemCount": 2,
      "itemsPreview": [
        {
          "name": "Handcrafted Merino Wool Beanie",
          "image": "https://res.cloudinary.com/wollyway/image/upload/v1/sample.webp",
          "quantity": 2
        }
      ],
      "orderTotal": 249900,
      "currency": "INR",
      "createdAt": "2026-08-19T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

### `GET /api/v1/orders/:id`
Retrieve detailed itemized receipt for a specific order.

* **Headers:** `Authorization: Bearer <token>`
* **Path Parameters:**
  - `id`: Order MongoDB ObjectId or public `orderNumber` (e.g. `WW-20260819-7F3A`).
* **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "66c2d1e0f4a8b5001e123456",
    "orderNumber": "WW-20260819-7F3A",
    "status": "CONFIRMED",
    "items": [
      {
        "productId": "65f8a0b0d3e5b3001f349a2a",
        "name": "Handcrafted Merino Wool Beanie",
        "slug": "handcrafted-merino-wool-beanie",
        "image": "https://res.cloudinary.com/wollyway/image/upload/v1/sample.webp",
        "price": 249900,
        "quantity": 1,
        "lineTotal": 249900
      }
    ],
    "shippingAddress": {
      "street": "123 Craft Lane",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postalCode": "560001",
      "country": "India"
    },
    "financials": {
      "subtotal": 249900,
      "shippingFee": 0,
      "taxTotal": 19992,
      "orderTotal": 269892,
      "currency": "INR"
    },
    "paymentInfo": {
      "provider": "razorpay",
      "status": "paid",
      "paidAt": "2026-08-19T14:30:00.000Z"
    },
    "fulfillment": {},
    "createdAt": "2026-08-19T14:30:00.000Z"
  }
}
```

---

### `POST /api/v1/orders/:id/cancel`
Cancel an active order in `CONFIRMED` or `PROCESSING` state and restock inventory.

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "reason": "Customer requested order cancellation"
}
```
* **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Order has been successfully cancelled and inventory restocked.",
  "data": {
    "id": "66c2d1e0f4a8b5001e123456",
    "orderNumber": "WW-20260819-7F3A",
    "status": "CANCELLED"
  }
}
```

---

## 3. Administrative Endpoints

### `GET /api/v1/orders/admin`
Paginated search and review of all store orders.

* **Headers:** `Authorization: Bearer <admin-token>`
* **Query Parameters:**
  - `status` (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
  - `orderNumber` (Partial or exact search)
  - `startDate` (ISO 8601 string)
  - `endDate` (ISO 8601 string)
  - `page` (default: 1)
  - `limit` (default: 20, max: 100)
* **Response `200 OK`:** Returns `AdminOrderDetailDTO[]` with customer contact and payment references.

---

### `PATCH /api/v1/orders/admin/:id/status`
Update fulfillment progression and carrier tracking details.

* **Headers:** `Authorization: Bearer <admin-token>`
* **Request Body:**
```json
{
  "status": "SHIPPED",
  "carrier": "BlueDart",
  "trackingNumber": "BD-892184912",
  "notes": "Dispatched via express air cargo"
}
```
* **Response `200 OK`:** Returns updated `AdminOrderDetailDTO`.

---

### `POST /api/v1/orders/admin/:id/cancel`
Administrative forced cancellation and inventory restocking.

* **Headers:** `Authorization: Bearer <admin-token>`
* **Request Body:**
```json
{
  "reason": "Out of raw yarn material for custom order"
}
```
* **Response `200 OK`:** Returns cancelled `AdminOrderDetailDTO`.
