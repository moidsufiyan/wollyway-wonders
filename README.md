# WollyWay

WollyWay is a modern, handcrafted e-commerce platform built with a clear separation of concerns, high performance, and secure transactional integrity in mind.

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App & Pages Router hybrid architecture)
- **Styling**: Tailwind CSS, Radix UI primitives, Framer Motion
- **State Management**: TanStack Query (React Query) for server state caching and synchronization
- **Language**: TypeScript

### Backend
- **Framework**: Node.js with Express
- **Database**: MongoDB (Mongoose) with Multi-Document ACID Transactions
- **Caching & Locking**: Redis (Session management, distributed locks, idempotency keys)
- **Media Storage**: Cloudinary (Secure signed uploads)
- **Payments**: Razorpay (Webhooks, HMAC SHA256 verification)
- **Language**: TypeScript

## Architecture & Technical Highlights

WollyWay is built with strict domain boundaries and enterprise-grade patterns:

- **Idempotency & Concurrency**: The checkout state machine utilizes Redis Lua scripts for atomic inventory reservation and distributed locks, ensuring race conditions cannot lead to overselling. 
- **ACID Transactions**: MongoDB Replica Set transactions are used for order fulfillment to ensure orders, inventory updates, and cart clears happen atomically.
- **Security Boundaries**: Strong separation between authenticated customer actions and administrative capabilities. Payment captures rely solely on cryptographically verified gateway webhooks, never trusting client-side signals.
- **Predictable Financials**: All currency logic operates on integer arithmetic (e.g., paise) internally to prevent floating-point inaccuracies, formatted cleanly on the client side.

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas, must be configured as a Replica Set for transactions)
- Redis (Running locally or via cloud provider)

### Environment Configuration

Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development

# Database & Cache
MONGO_URI=mongodb://localhost:27017/wollyway
REDIS_URI=redis://localhost:6379

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Application URLs
FRONTEND_URL=http://localhost:3000
```

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Running the Application

1. **Install dependencies:**
   Run `npm install` in the root directory and the `backend` directory.

2. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend:**
   ```bash
   # From the root directory
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:5000`.

## Directory Structure

```
├── app/                  # Next.js App Router entrypoints
├── backend/              # Express backend service
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express route definitions
│   │   ├── services/     # Business logic
│   │   └── utils/        # Shared utilities
├── docs/                 # Architectural documentation & ADRs
├── src/                  # Next.js Pages Router and React components
│   ├── components/       # Shared UI components
│   ├── contexts/         # React Context providers (Auth, Cart, Wishlist)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Frontend utilities and API clients
│   ├── types/            # Shared TypeScript interfaces
│   └── views/            # High-level page components
```

## Documentation

For deep dives into specific domains and architectural decisions, see the `docs/` directory:
- `docs/checkout-state-machine.md`
- `docs/backend-architecture-blueprint.md`
- `docs/business-rules.md`
- `docs/adr/` (Architecture Decision Records)
