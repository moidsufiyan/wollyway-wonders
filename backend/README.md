# WollyWay Backend API Gateway

Production-grade Express + TypeScript API gateway foundation for WollyWay, a handcrafted woollen single-vendor e-commerce platform.

---

## 🛠️ Tech Stack Foundation
* **Express & Node.js**: Clean request-routing, parsing, and pipeline orchestration.
* **TypeScript**: Enforces 100% strict type safety and interface definitions.
* **Pino & Pino-HTTP**: High-performance request logging with unique correlation UUID mappings.
* **Helmet & CORS**: Hardens API security headers and resolves cross-origin matching rules.
* **Zod**: Type-safe payload validation parsing for body, query, and params.
* **Docker & Compose**: Portable dev container environment mirroring production dependencies.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- MongoDB Atlas account or local installation
- Redis server or local container

### Local Environment Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your connection URIs, JWT signing keys, and Razorpay/Cloudinary credentials.

### Installation
Install project dependencies:
```bash
npm install
```

### Running the API
* **Development Mode** (with watch reload):
  ```bash
  npm run dev
  ```
* **Production Build**:
  ```bash
  npm run build
  ```
* **Production Start**:
  ```bash
  npm run start
  ```

---

## 🔬 Local Code Quality Checks
* **Format source code**:
  ```bash
  npm run format
  ```
* **Lint codebase**:
  ```bash
  npm run lint
  ```

---

## 🐳 Containerized Development (Docker)

Ensure Docker Desktop is running locally.

* **Spin up the backend alongside local database and cache**:
  ```bash
  docker compose up --build
  ```
* **Stop and remove container volumes**:
  ```bash
  docker compose down -v
  ```

---

## 📄 Core API Endpoints (Foundation)
* **Diagnostic health status check**: `GET /api/v1/health`
* **Swagger OpenAPI Documentation**: `GET /api-docs`
