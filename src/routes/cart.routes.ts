import { Request, Response, Router } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { 
  validateCreateCartMiddleware,
  validateGetCartMiddleware,
  validateAddItemMiddleware,
  validateUpdateQuantityMiddleware,
  validateRemoveItemMiddleware
} from '../middlewares/routeValidation.js';
import { asyncHandler } from '../middlewares/serviceErrorHandler.js';

export function createCartRoutes(cartController: CartController): Router {
  const router = Router();

  // POST /cart - Create new cart context
  router.post('/create', validateCreateCartMiddleware, asyncHandler(async (req: Request, res: Response) => {
    await cartController.createCart(req, res);
  }));

  // GET /cart/:cartId - Get cart
  router.get('/:cartId', validateGetCartMiddleware, asyncHandler(async (req: Request, res: Response) => {
    await cartController.getCart(req, res);
  }));

  // POST /cart/:cartId/items - Add item to cart
  router.post('/:cartId/items', validateAddItemMiddleware, asyncHandler(async (req: Request, res: Response) => {
    await cartController.addItem(req, res);
  }));

  // PUT /cart/:cartId/items/:itemId - Update item quantity
  router.put('/:cartId/items/:itemId', validateUpdateQuantityMiddleware, asyncHandler(async (req: Request, res: Response) => {
    await cartController.updateQuantity(req, res);
  }));

  // DELETE /cart/:cartId/items/:itemId - Remove item from cart
  router.delete('/:cartId/items/:itemId', validateRemoveItemMiddleware, asyncHandler(async (req: Request, res: Response) => {
    await cartController.removeItem(req, res);
  }));

  return router;
}