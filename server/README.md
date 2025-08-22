# Backend Server (Disabled)

This backend server has been disabled to create a frontend-only version of WollyWay.

## Original Backend Features (Now Replaced with Mock Data)

The original backend included:
- Express.js server with MongoDB
- User authentication with JWT
- Product management APIs
- Order processing APIs
- RESTful API endpoints

## Current Implementation

The frontend now uses:
- Static JSON data files in `src/data/`
- Mock API services in `src/services/api.ts`
- localStorage for cart, wishlist, and order persistence
- Mock checkout flow without real payments

To re-enable the backend:
1. Uncomment the server files
2. Update the API service to use real HTTP endpoints
3. Set up MongoDB connection
4. Configure environment variables

## Files Disabled

- `server.js` - Main Express server
- `routes/` - API route handlers
- `controllers/` - Business logic controllers
- `models/` - MongoDB schemas
- `middleware/` - Authentication middleware
- `.env` - Environment configuration