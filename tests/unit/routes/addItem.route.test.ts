import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { createCartRoutes } from '../../../src/routes/cart.routes.js';
import { CartController } from '../../../src/controllers/cart.controller.js';
import { CartService } from '../../../src/services/cart.service.js';
import { errorHandler } from '../../../src/middlewares/errorHandler.js';
import { Cart } from '../../../src/domain/types.js';

// Mock the CartService
jest.mock('../../../src/services/cart.service.js');

describe('Cart Routes - Add Item', () => {
  let app: express.Application;
  let mockCartService: jest.Mocked<CartService>;
  let cartController: CartController;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock CartService
    mockCartService = {
        createCart: jest.fn(),
        getCart: jest.fn(),
        addItem: jest.fn(),
        updateQuantity: jest.fn(),
        removeItem: jest.fn(),
    } as unknown as jest.Mocked<CartService>;

    // Create controller with mocked service
    cartController = new CartController(mockCartService);

    // Create Express app with routes
    app = express();
    app.use(express.json());
    app.use('/cart', createCartRoutes(cartController));
    app.use(errorHandler);
  });

  describe('POST /cart/:cartId/items', () => {
    const validCartId = '123456789012';
    const mockCartResponse: Cart = {
      cartId: validCartId,
      currency: 'USD',
      items: [{
        itemId: '987654321098',
        sku: 'PHONE_X',
        name: 'Phone X',
        price: { amount: 999.99, currency: 'USD' },
        quantity: 1,
        subtotal: { amount: 999.99, currency: 'USD' }
      }],
      subtotal: { amount: 999.99, currency: 'USD' },
      tax: { amount: 99.999, currency: 'USD' },
      total: { amount: 1099.989, currency: 'USD' },
      expiresAt: 1640995200000 + (15 * 60 * 1000)
    };

    it('should add item successfully with valid data', async () => {
      // Arrange
      const itemRequest = {
        sku: 'PHONE_X',
        name: 'Phone X',
        price: 999.99,
        quantity: 1
      };

      mockCartService.addItem.mockReturnValue(mockCartResponse);

      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send(itemRequest)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockCartResponse);
      expect(mockCartService.addItem).toHaveBeenCalledWith(validCartId, itemRequest);
      expect(mockCartService.addItem).toHaveBeenCalledTimes(1);
    });

    it('should add item with decimal price correctly', async () => {
      // Arrange
      const itemRequest = {
        sku: 'TABLET_Y',
        name: 'Tablet Y',
        price: 599.95,
        quantity: 2
      };

      mockCartService.addItem.mockReturnValue(mockCartResponse);

      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send(itemRequest)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockCartResponse);
      expect(mockCartService.addItem).toHaveBeenCalledWith(validCartId, itemRequest);
    });

    it('should return 400 for missing SKU', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          name: 'Phone X',
          price: 999.99,
          quantity: 1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for empty SKU', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: '',
          name: 'Phone X',
          price: 999.99,
          quantity: 1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for non-string SKU', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 123,
          name: 'Phone X',
          price: 999.99,
          quantity: 1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for missing name', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          price: 999.99,
          quantity: 1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for empty name', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: '',
          price: 999.99,
          quantity: 1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for non-string name', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: 123,
          price: 999.99,
          quantity: 1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for missing price', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: 'Phone X',
          quantity: 1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for zero price', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: 'Phone X',
          price: 0,
          quantity: 1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for negative price', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: 'Phone X',
          price: -100,
          quantity: 1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for non-numeric price', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: 'Phone X',
          price: 'expensive',
          quantity: 1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for missing quantity', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: 'Phone X',
          price: 999.99
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for zero quantity', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: 'Phone X',
          price: 999.99,
          quantity: 0
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for negative quantity', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: 'Phone X',
          price: 999.99,
          quantity: -1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for non-integer quantity', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: 'Phone X',
          price: 999.99,
          quantity: 1.5
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should return 400 for non-numeric quantity', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: 'Phone X',
          price: 999.99,
          quantity: 'many'
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should handle very large price values', async () => {
      // Arrange
      const itemRequest = {
        sku: 'EXPENSIVE_ITEM',
        name: 'Very Expensive Item',
        price: 999999999.99,
        quantity: 1
      };

      mockCartService.addItem.mockReturnValue(mockCartResponse);

      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send(itemRequest)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockCartResponse);
      expect(mockCartService.addItem).toHaveBeenCalledWith(validCartId, itemRequest);
    });

    it('should handle very large quantity values', async () => {
      // Arrange
      const itemRequest = {
        sku: 'BULK_ITEM',
        name: 'Bulk Item',
        price: 0.01,
        quantity: 1000000
      };

      mockCartService.addItem.mockReturnValue(mockCartResponse);

      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send(itemRequest)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockCartResponse);
      expect(mockCartService.addItem).toHaveBeenCalledWith(validCartId, itemRequest);
    });

    it('should handle very long SKU strings', async () => {
      // Arrange
      const longSku = 'A'.repeat(1000);
      const itemRequest = {
        sku: longSku,
        name: 'Long SKU Item',
        price: 99.99,
        quantity: 1
      };

      mockCartService.addItem.mockReturnValue(mockCartResponse);

      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send(itemRequest)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockCartResponse);
      expect(mockCartService.addItem).toHaveBeenCalledWith(validCartId, itemRequest);
    });

    it('should handle very long name strings', async () => {
      // Arrange
      const longName = 'B'.repeat(1000);
      const itemRequest = {
        sku: 'LONG_NAME_ITEM',
        name: longName,
        price: 99.99,
        quantity: 1
      };

      mockCartService.addItem.mockReturnValue(mockCartResponse);

      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send(itemRequest)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockCartResponse);
      expect(mockCartService.addItem).toHaveBeenCalledWith(validCartId, itemRequest);
    });

    it('should handle malformed JSON request', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(500); // Express throws 500 for malformed JSON

      // Assert
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should handle null field values', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: null,
          name: 'Phone X',
          price: 999.99,
          quantity: 1
        })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should handle undefined field values', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({
          sku: 'PHONE_X',
          name: undefined, // This becomes missing field after JSON.stringify
          price: 999.99,
          quantity: 1
        })
        .expect(400);

      // Assert - undefined gets stripped by JSON.stringify, so becomes missing field
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });

    it('should handle minimum valid price', async () => {
      // Arrange
      const itemRequest = {
        sku: 'CHEAP_ITEM',
        name: 'Very Cheap Item',
        price: 0.01,
        quantity: 1
      };

      mockCartService.addItem.mockReturnValue(mockCartResponse);

      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send(itemRequest)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockCartResponse);
      expect(mockCartService.addItem).toHaveBeenCalledWith(validCartId, itemRequest);
    });

    it('should handle empty request body', async () => {
      // Act
      const response = await request(app)
        .post(`/cart/${validCartId}/items`)
        .send({})
        .expect(400);

      // Assert - All required fields missing
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      });
      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });
  });
});