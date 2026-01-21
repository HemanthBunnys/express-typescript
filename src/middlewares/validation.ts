import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../domain/errors.js';
import { AddItemRequest, UpdateQuantityRequest, CreateCartRequest } from '../domain/types.js';
import { VALIDATION_MESSAGES, VALIDATION_CONSTANTS } from '../constants/validationMessages.js';

// Parameter validation middleware
export function validateCartId(req: Request, _: Response, next: NextFunction): void {
  const cartId = req.params.cartId;
  if (!cartId || typeof cartId !== 'string') {
    throw new ValidationError(VALIDATION_MESSAGES.CART_ID_REQUIRED);
  }
  next();
}

export function validateItemId(req: Request, _: Response, next: NextFunction): void {
  const itemId = req.params.itemId;
  if (!itemId || typeof itemId !== 'string') {
    throw new ValidationError(VALIDATION_MESSAGES.ITEM_ID_REQUIRED);
  }
  next();
}

// Body validation middleware
export function validateCreateCartRequest(req: Request, _: Response, next: NextFunction): void {
  const request = req?.body as CreateCartRequest;

  // Allow empty body or body without currency (defaults to USD in service)
  // But if currency is provided, it must be a valid string
  if (request && request.currency !== undefined) {
    if (typeof request.currency !== 'string' || request.currency.trim() === '') {
      throw new ValidationError(VALIDATION_MESSAGES.CURRENCY_INVALID);
    }
  }
  
  next();
}

export function validateAddItemRequest(req: Request, _: Response, next: NextFunction): void {
  if (!req.body || typeof req.body !== 'object') {
    throw new ValidationError(VALIDATION_MESSAGES.VALIDATION_FAILED, { 
      errors: ['Request body is required'] 
    });
  }
  
  const request = req.body as AddItemRequest;
  const errors: string[] = [];

  if (!request.sku || typeof request.sku !== 'string') {
    errors.push(VALIDATION_MESSAGES.SKU_REQUIRED);
  }

  if (!request.name || typeof request.name !== 'string') {
    errors.push(VALIDATION_MESSAGES.NAME_REQUIRED);
  }

  if (typeof request.price !== 'number' || request.price <= 0) {
    errors.push(VALIDATION_MESSAGES.PRICE_INVALID);
  }

  if (!Number.isInteger(request.quantity) || request.quantity <= 0) {
    errors.push(VALIDATION_MESSAGES.QUANTITY_INVALID);
  } else if (request.quantity > VALIDATION_CONSTANTS.MAX_QUANTITY) {
    errors.push(VALIDATION_MESSAGES.QUANTITY_EXCEEDS_MAX);
  }

  if (errors.length > 0) {
    throw new ValidationError(VALIDATION_MESSAGES.VALIDATION_FAILED, { errors });
  }

  next();
}

export function validateUpdateQuantityRequest(req: Request, _: Response, next: NextFunction): void {
  const request = req.body as UpdateQuantityRequest;
  
  if (!request || typeof request !== 'object') {
    throw new ValidationError(VALIDATION_MESSAGES.VALIDATION_FAILED, { 
      errors: ['Request body is required'] 
    });
  }
  
  if (!Number.isInteger(request.quantity) || request.quantity <= 0) {
    throw new ValidationError(VALIDATION_MESSAGES.QUANTITY_UPDATE_INVALID);
  }
  
  if (request.quantity > VALIDATION_CONSTANTS.MAX_QUANTITY) {
    throw new ValidationError(VALIDATION_MESSAGES.QUANTITY_EXCEEDS_MAX);
  }
  
  next();
}
