import { IncomingMessage } from 'http';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';

import { env } from './config/env.config.js';
import { logger } from './utils/logger.js';
import { requestId } from './middlewares/requestId.middleware.js';
import { rateLimiter } from './middlewares/rateLimiter.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import productRoutes from './routes/product.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import cartRoutes from './routes/cart.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import { setupSwagger } from './config/swagger.config.js';

import { API } from './constants/index.js';

const app = express();

// Set up correlation request ID before logging/routing
app.use(requestId);

// Setup Pino HTTP log request tracker
app.use(
  pinoHttp({
    logger,
    genReqId: (req: IncomingMessage) => (req as IncomingMessage & { id?: string }).id || 'unknown',

    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

// Standard security layers
app.use(helmet());
// Build the allowed-origin allowlist from the comma-separated CORS_ORIGIN env var.
// Supports multiple origins (e.g. localhost for dev + Vercel URL for production).
const allowedOrigins = env.CORS_ORIGIN.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    /**
     * Dynamic origin validation.
     *
     * WHY A FUNCTION INSTEAD OF A STRING?
     * A static origin string only allows one origin. In a real deployment:
     *   - Local dev: http://localhost:3000
     *   - Production: https://wollyway.vercel.app
     * Both must be able to reach the API.
     *
     * WHY NOT origin: '*'?
     * credentials: true requires an explicit origin — `*` is rejected
     * by browsers when credentials (cookies) are involved.
     *
     * COOKIE BEHAVIOR:
     * The `credentials: true` option here tells Express to include
     * Access-Control-Allow-Credentials: true in responses. This is what
     * allows the browser to send and receive the HTTP-only refresh cookie
     * on cross-origin requests.
     */
    origin: (incomingOrigin, callback) => {
      // Allow server-to-server requests (no Origin header, e.g. curl, Postman)
      if (!incomingOrigin) return callback(null, true);
      if (allowedOrigins.includes(incomingOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin '${incomingOrigin}' is not allowed`));
    },
    credentials: true,
  })
);

// Performance & Parsing
app.use(compression());
app.use(cookieParser());
app.use(
  express.json({
    verify: (req: IncomingMessage & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Apply basic rate limiting
app.use(rateLimiter);

// Register health check and swagger docs
setupSwagger(app);
app.use(`${API.PREFIX}/${API.VERSION}/health`, healthRoutes);
app.use(`${API.PREFIX}/${API.VERSION}/auth`, authRoutes);
app.use(`${API.PREFIX}/${API.VERSION}/users`, userRoutes);
app.use(`${API.PREFIX}/${API.VERSION}/categories`, categoryRoutes);
app.use(`${API.PREFIX}/${API.VERSION}/inventory`, inventoryRoutes);
app.use(`${API.PREFIX}/${API.VERSION}/products`, productRoutes);
app.use(`${API.PREFIX}/${API.VERSION}/wishlist`, wishlistRoutes);
app.use(`${API.PREFIX}/${API.VERSION}/cart`, cartRoutes);
app.use(`${API.PREFIX}/${API.VERSION}/checkout`, checkoutRoutes);
app.use(`${API.PREFIX}/${API.VERSION}/orders`, orderRoutes);
app.use(`${API.PREFIX}/${API.VERSION}/payments`, paymentRoutes);

// Unhandled route triggers
app.use(notFoundHandler);

// Central error boundary
app.use(errorHandler);

export default app;
