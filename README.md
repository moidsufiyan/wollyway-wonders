
# WollyWay E-commerce Platform

A full-stack e-commerce website built with React, Node.js, Express, and MongoDB.

## Features

- Product browsing and searching
- Product categories and filtering
- Product bundles and discounts
- Shopping cart functionality
- User authentication and profiles
- Order processing and management
- Admin dashboard

## Tech Stack

### Frontend
- React
- TypeScript
- React Router
- TanStack Query (React Query)
- Tailwind CSS
- Shadcn UI Components
- Framer Motion

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas connection)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/wollyway-ecommerce.git
cd wollyway-ecommerce
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd server
npm install
```

4. Set up environment variables
   - Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/wollyway
JWT_SECRET=your_super_secret_key_change_in_production
```

5. Run the development servers

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd server
npm run dev
```

The frontend will be available at http://localhost:5173 and the backend at http://localhost:5000.

## Project Structure

```
├── public/             # Static assets
├── server/             # Backend code
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.js       # Server entry point
├── src/                # Frontend code
│   ├── components/     # Reusable components
│   ├── contexts/       # Context providers
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── main.tsx        # Entry point
└── README.md           # Project documentation
```

## Deployment

1. Build the frontend
```bash
npm run build
```

2. Set up your production environment variables for the backend

3. Start the server in production mode
```bash
cd server
npm start
```

## Next Steps for Development

1. Implement image upload functionality
2. Add product reviews and ratings
3. Create advanced search and filtering
4. Add payment gateway integration (Stripe/PayPal)
5. Implement email notifications
6. Set up automated testing
