// Validation error messages
export const VALIDATION_MESSAGES = {
  // Parameter validation
  CART_ID_REQUIRED: 'Cart ID is required and must be a string',
  ITEM_ID_REQUIRED: 'Item ID is required and must be a string',
  
  // Create cart validation  
  CURRENCY_INVALID: 'Currency must be a non-empty string',
  
  // Add item validation
  VALIDATION_FAILED: 'Validation failed',
  SKU_REQUIRED: 'SKU is required and must be a string',
  NAME_REQUIRED: 'Name is required and must be a string', 
  PRICE_INVALID: 'Price is required and must be a positive number',
  QUANTITY_INVALID: 'Quantity is required and must be a positive integer',
  QUANTITY_EXCEEDS_MAX: 'Quantity exceeds maximum allowed value',
  
  // Update quantity validation
  QUANTITY_UPDATE_INVALID: 'Quantity must be a positive integer'
} as const;

// Validation constants
export const VALIDATION_CONSTANTS = {
  MAX_QUANTITY: 9999,
  MAX_ITEMS_IN_CART: 100
} as const;

// Client error messages
export const CLIENT_ERROR_MESSAGES = {
  CART_NOT_FOUND: 'Cart not found',
  ITEM_NOT_FOUND: 'Item not found',
  CONTEXT_EXPIRED: 'Cart context expired'
} as const;
