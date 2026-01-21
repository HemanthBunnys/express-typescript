import { Request, Response, NextFunction } from 'express';
import { 
  validateCartId, 
  validateItemId, 
  validateCreateCartRequest, 
  validateAddItemRequest, 
  validateUpdateQuantityRequest 
} from './validation.js';

// Helper to run multiple validations and collect errors
function runValidations(
  req: Request, 
  res: Response, 
  validations: Array<(req: Request, res: Response, next: NextFunction) => void>
): void {
  for (const validation of validations) {
    // Each validation throws on error, so first error stops execution
    validation(req, res, () => {});
  }
}

// Individual middleware for each route
export function validateCreateCartMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    validateCreateCartRequest(req, res, next);
  } catch (error) {
    next(error);
  }
}

export function validateGetCartMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    validateCartId(req, res, next);
  } catch (error) {
    next(error);
  }
}

export function validateAddItemMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    runValidations(req, res, [validateCartId, validateAddItemRequest]);
    next();
  } catch (error) {
    next(error);
  }
}

export function validateUpdateQuantityMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    runValidations(req, res, [validateCartId, validateItemId, validateUpdateQuantityRequest]);
    next();
  } catch (error) {
    next(error);
  }
}

export function validateRemoveItemMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    runValidations(req, res, [validateCartId, validateItemId]);
    next();
  } catch (error) {
    next(error);
  }
}
