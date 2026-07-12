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
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Performance & Parsing
app.use(compression());
app.use(cookieParser());
app.use(express.json());
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

// Unhandled route triggers
app.use(notFoundHandler);

// Central error boundary
app.use(errorHandler);

export default app;
