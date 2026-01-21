import { Cart, LineItem, SalesforceCartContext } from '../domain/types.js';
import { ContextExpiredError, NotFoundError, ValidationError } from '../domain/errors.js';
import { Clock, systemClock } from '../utils/clock.js';
import { CLIENT_ERROR_MESSAGES } from '../constants/validationMessages.js';
import { VALIDATION_CONSTANTS } from '../constants/validationMessages.js';

export class SalesforceCartClient {
  private contexts = new Map<string, SalesforceCartContext>();
  private readonly defaultTtlMs: number;
  private readonly clock: Clock;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(ttlMinutes: number = 15, clock: Clock = systemClock) {
    this.defaultTtlMs = ttlMinutes * 60 * 1000;
    this.clock = clock;
    this.startPeriodicCleanup();
  }

  private startPeriodicCleanup(): void {
    // Clean up expired contexts every 40 minutes
    const cleanupIntervalMs = 40 * 60 * 1000; // 40 minutes
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredContexts();
    }, cleanupIntervalMs);
  }

  private cleanupExpiredContexts(): void {
    const now = this.clock.now();
    const expiredCartIds: string[] = [];

    // Find expired contexts
    for (const [cartId, context] of this.contexts.entries()) {
      if (now > context.expiresAt) {
        expiredCartIds.push(cartId);
      }
    }

    // Remove expired contexts
    expiredCartIds.forEach(cartId => {
      this.contexts.delete(cartId);
    });

    console.log(`Cleaned up ${expiredCartIds.length} expired cart contexts`);
  }

  private generateUniqueNumber(): string {
    // Generate a 12-digit random numeric string
    return Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  }

  createContext(currency: string = 'USD'): { cartId: string; expiresAt: number } {
    let cartId: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Ensure unique cart ID
    do {
      cartId = this.generateUniqueNumber();
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique cart ID after maximum attempts');
      }
    } while (this.contexts.has(cartId));
    
    const expiresAt = this.clock.now() + this.defaultTtlMs;
    
    const context: SalesforceCartContext = {
      cartId,
      currency,
      items: [],
      expiresAt
    };

    this.contexts.set(cartId, context);
    
    return { cartId, expiresAt };
  }

  getCart(cartId: string): Cart {
    const context = this.getValidContext(cartId);
    return this.buildCartResponse(context);
  }

  addItem(cartId: string, sku: string, name: string, price: number, quantity: number): Cart {
    const context = this.getValidContext(cartId);

    // Check if item with same SKU already exists
    const existingItemIndex = context.items.findIndex(item => item.sku === sku);
    
    if (existingItemIndex >= 0) {
      // Merge quantities for existing SKU
      context.items[existingItemIndex].quantity += quantity;
      context.items[existingItemIndex].subtotal = {
        amount: context.items[existingItemIndex].quantity * price,
        currency: context.currency
      };
    } else {
      // Check max items limit before adding new item
      if (context.items.length >= VALIDATION_CONSTANTS.MAX_ITEMS_IN_CART) {
        throw new ValidationError(
          `Cart cannot contain more than ${VALIDATION_CONSTANTS.MAX_ITEMS_IN_CART} unique items`,
          { cartId, currentItemCount: context.items.length }
        );
      }
      
      // Add new item
      const newItem: LineItem = {
        itemId: this.generateUniqueNumber(),
        sku,
        name,
        price: { amount: price, currency: context.currency },
        quantity,
        subtotal: { amount: price * quantity, currency: context.currency }
      };
      context.items.push(newItem);
    }

    return this.buildCartResponse(context);
  }

  updateQuantity(cartId: string, itemId: string, quantity: number): Cart {
    const context = this.getValidContext(cartId);
    
    const itemIndex = context.items.findIndex(item => item.itemId === itemId);
    if (itemIndex === -1) {
      throw new NotFoundError(CLIENT_ERROR_MESSAGES.ITEM_NOT_FOUND, { itemId });
    }

    context.items[itemIndex].quantity = quantity;
    context.items[itemIndex].subtotal = {
      amount: context.items[itemIndex].price.amount * quantity,
      currency: context.currency
    };

    return this.buildCartResponse(context);
  }

  removeItem(cartId: string, itemId: string): Cart {
    const context = this.getValidContext(cartId);
    
    const itemIndex = context.items.findIndex(item => item.itemId === itemId);
    if (itemIndex === -1) {
      throw new NotFoundError(CLIENT_ERROR_MESSAGES.ITEM_NOT_FOUND, { itemId });
    }

    context.items.splice(itemIndex, 1);
    return this.buildCartResponse(context);
  }

  private getValidContext(cartId: string): SalesforceCartContext {
    const context = this.contexts.get(cartId);
    if (!context) {
      throw new NotFoundError(CLIENT_ERROR_MESSAGES.CART_NOT_FOUND, { cartId });
    }

    const now = this.clock.now();
    if (now > context.expiresAt) {
      this.contexts.delete(cartId);
      throw new ContextExpiredError(CLIENT_ERROR_MESSAGES.CONTEXT_EXPIRED, { 
        cartId, 
        expiredAt: context.expiresAt 
      });
    }

    return context;
  }

  private buildCartResponse(context: SalesforceCartContext): Cart {
    const subtotalAmount = context.items.reduce((sum, item) => sum + item.subtotal.amount, 0);
    const taxAmount = Math.round(subtotalAmount * 0.1 * 100) / 100;
    const totalAmount = Math.round((subtotalAmount + taxAmount) * 100) / 100;

    return {
      cartId: context.cartId,
      currency: context.currency,
      items: context.items,
      subtotal: { amount: Math.round(subtotalAmount * 100) / 100, currency: context.currency },
      tax: { amount: taxAmount, currency: context.currency },
      total: { amount: totalAmount, currency: context.currency },
      expiresAt: context.expiresAt
    };
  }
}
