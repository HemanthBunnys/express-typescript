import { SalesforceCartClient } from '../clients/SalesforceCartClient.js';
import { Cart, CreateCartRequest, AddItemRequest, UpdateQuantityRequest, CreateCartResponse } from '../domain/types.js';
import { getDefaultLogger, Logger } from '../utils/logger.js';

export class CartService {
  constructor(
    private salesforceClient: SalesforceCartClient,
    private logger: Logger = getDefaultLogger()
  ) {}

  createCart(data: CreateCartRequest): CreateCartResponse {
    this.logger.info('Creating new cart', { currency: data.currency });
    const currency = data.currency || 'USD';
    const result = this.salesforceClient.createContext(currency);
    this.logger.info('Cart created successfully', { cartId: result.cartId, expiresAt: result.expiresAt });
    return result;
  }

  getCart(cartId: string): Cart {
    this.logger.info('Retrieving cart', { cartId });
    const cart = this.salesforceClient.getCart(cartId);
    this.logger.info('Cart retrieved successfully', { 
      cartId, 
      itemCount: cart.items.length, 
      total: cart.total.amount 
    });
    return cart;
  }

  addItem(cartId: string, request: AddItemRequest): Cart {
    this.logger.info('Adding item to cart', { 
      cartId, 
      sku: request.sku, 
      quantity: request.quantity, 
      price: request.price 
    });
    const cart = this.salesforceClient.addItem(
      cartId,
      request.sku,
      request.name,
      request.price,
      request.quantity
    );
    this.logger.info('Item added successfully', { 
      cartId, 
      sku: request.sku, 
      totalItems: cart.items.length,
      cartTotal: cart.total.amount
    });
    return cart;
  }

  updateQuantity(cartId: string, itemId: string, request: UpdateQuantityRequest): Cart {
    this.logger.info('Updating item quantity', { 
      cartId, 
      itemId, 
      newQuantity: request.quantity 
    });
    const cart = this.salesforceClient.updateQuantity(cartId, itemId, request.quantity);
    this.logger.info('Item quantity updated successfully', { 
      cartId, 
      itemId, 
      quantity: request.quantity,
      cartTotal: cart.total.amount
    });
    return cart;
  }

  removeItem(cartId: string, itemId: string): Cart {
    this.logger.info('Removing item from cart', { cartId, itemId });
    const cart = this.salesforceClient.removeItem(cartId, itemId);
    this.logger.info('Item removed successfully', { 
      cartId, 
      itemId, 
      remainingItems: cart.items.length,
      cartTotal: cart.total.amount
    });
    return cart;
  }
}
