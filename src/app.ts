import express from 'express';
import { SalesforceCartClient } from './clients/SalesforceCartClient.js';
import { CartService } from './services/cart.service.js';
import { CartController } from './controllers/cart.controller.js';
import { createCartRoutes } from './routes/cart.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { createServiceErrorHandler } from './middlewares/serviceErrorHandler.js';
import { Clock, systemClock } from './utils/clock.js';

export function createApp(clock: Clock = systemClock): express.Application {
  const app = express();

  // Middleware
  app.use(express.json());

  // Dependency injection
  const salesforceClient = new SalesforceCartClient(15, clock); // 15 minute TTL
  const cartService = new CartService(salesforceClient);
  const cartController = new CartController(cartService);

  // Routes
  app.use('/cart', createCartRoutes(cartController));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: clock.now() });
  });

  // Error handling middleware (order matters)
  app.use(createServiceErrorHandler()); // Service-specific error logging
  app.use(errorHandler); // General error response formatting

  return app;
}