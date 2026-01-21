import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { createCartRoutes } from '../../../src/routes/cart.routes.js';
import { CartController } from '../../../src/controllers/cart.controller.js';
import { CartService } from '../../../src/services/cart.service.js';
import { errorHandler } from '../../../src/middlewares/errorHandler.js';
import { CreateCartResponse } from '../../../src/domain/types.js';

// Mock the CartService
jest.mock('../../../src/services/cart.service.js');

describe('Cart Routes - Create Cart', () => {
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

  describe('POST /cart/create', () => {
    it('should create a new cart successfully with default currency', async () => {
      // Arrange
      const mockResult: CreateCartResponse = {
        cartId: '123456789012',
        expiresAt: 1640995200000 + (15 * 60 * 1000)
      };
      
      mockCartService.createCart.mockReturnValue(mockResult);

      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({})
        .expect(201);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(mockCartService.createCart).toHaveBeenCalledWith({});
      expect(mockCartService.createCart).toHaveBeenCalledTimes(1);
    });

    it('should create a new cart with specified valid currency', async () => {
      // Arrange
      const mockResult: CreateCartResponse = {
        cartId: '987654321098',
        expiresAt: 1640995200000 + (15 * 60 * 1000)
      };
      
      mockCartService.createCart.mockReturnValue(mockResult);

      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({ currency: 'EUR' })
        .expect(201);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(mockCartService.createCart).toHaveBeenCalledWith({ currency: 'EUR' });
      expect(mockCartService.createCart).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for invalid currency type (number)', async () => {
      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({ currency: 123 })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Currency must be a string'
      });
      expect(mockCartService.createCart).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid currency type (boolean)', async () => {
      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({ currency: true })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Currency must be a string'
      });
      expect(mockCartService.createCart).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid currency type (object)', async () => {
      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({ currency: { code: 'USD' } })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Currency must be a string'
      });
      expect(mockCartService.createCart).not.toHaveBeenCalled();
    });

    it('should handle valid currency with extra fields in request body', async () => {
      // Arrange
      const mockResult: CreateCartResponse = {
        cartId: '555666777888',
        expiresAt: 1640995200000 + (15 * 60 * 1000)
      };
      
      mockCartService.createCart.mockReturnValue(mockResult);

      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({ 
          currency: 'GBP',
          extraField: 'ignored',
          anotherField: 123
        })
        .expect(201);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(mockCartService.createCart).toHaveBeenCalledWith({
        currency: 'GBP',
        extraField: 'ignored',
        anotherField: 123
      });
    });

    it('should accept empty string currency and pass to service', async () => {
      // Arrange
      const mockResult: CreateCartResponse = {
        cartId: '111222333444',
        expiresAt: 1640995200000 + (15 * 60 * 1000)
      };
      
      mockCartService.createCart.mockReturnValue(mockResult);

      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({ currency: '' })
        .expect(201);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(mockCartService.createCart).toHaveBeenCalledWith({ currency: '' });
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const serviceError = new Error('Service unavailable');
      mockCartService.createCart.mockImplementation(() => {
        throw serviceError;
      });

      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({})
        .expect(500);

      // Assert
      expect(response.body).toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      });
      expect(mockCartService.createCart).toHaveBeenCalledWith({});
    });

    it('should handle malformed JSON request', async () => {
      // Act
      const response = await request(app)
        .post('/cart/create')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(500); // Express throws 500 for malformed JSON

      // Assert - Express automatically handles malformed JSON
      expect(mockCartService.createCart).not.toHaveBeenCalled();
    });

    it('should handle request without Content-Type header', async () => {
      // Act - Without Content-Type: application/json, body won't be parsed as JSON
      const response = await request(app)
        .post('/cart/create')
        .send('{}')
        .expect(500); // This will fail because body parsing fails

      // Assert - Service won't be called due to parsing error
      expect(mockCartService.createCart).not.toHaveBeenCalled();
    });

    it('should handle very long currency string', async () => {
      // Arrange
      const longCurrency = 'A'.repeat(1000);
      const mockResult: CreateCartResponse = {
        cartId: '123123123123',
        expiresAt: 1640995200000 + (15 * 60 * 1000)
      };
      
      mockCartService.createCart.mockReturnValue(mockResult);

      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({ currency: longCurrency })
        .expect(201);

      // Assert - Service should handle validation, route just passes through
      expect(response.body).toEqual(mockResult);
      expect(mockCartService.createCart).toHaveBeenCalledWith({ currency: longCurrency });
    });

    it('should handle special characters in currency', async () => {
      // Arrange
      const specialCurrency = 'U$D@123';
      const mockResult: CreateCartResponse = {
        cartId: '456456456456',
        expiresAt: 1640995200000 + (15 * 60 * 1000)
      };
      
      mockCartService.createCart.mockReturnValue(mockResult);

      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({ currency: specialCurrency })
        .expect(201);

      // Assert - Route validation only checks type, not format
      expect(response.body).toEqual(mockResult);
      expect(mockCartService.createCart).toHaveBeenCalledWith({ currency: specialCurrency });
    });

    it('should handle null currency value', async () => {
      // Arrange - null passes typeof check (typeof null === 'object'), validation allows it
      const mockResult: CreateCartResponse = {
        cartId: '999000999000',
        expiresAt: 1640995200000 + (15 * 60 * 1000)
      };
      
      mockCartService.createCart.mockReturnValue(mockResult);

      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({ currency: null })
        .expect(201);

      // Assert - null passes through validation
      expect(response.body).toEqual(mockResult);
      expect(mockCartService.createCart).toHaveBeenCalledWith({ currency: null });
    });

    it('should handle undefined currency value (same as empty object)', async () => {
      // Arrange
      const mockResult: CreateCartResponse = {
        cartId: '789789789789',
        expiresAt: 1640995200000 + (15 * 60 * 1000)
      };
      
      mockCartService.createCart.mockReturnValue(mockResult);

      // Act
      const response = await request(app)
        .post('/cart/create')
        .send({ currency: undefined })
        .expect(201);

      // Assert - undefined gets stripped by JSON.stringify
      expect(response.body).toEqual(mockResult);
      expect(mockCartService.createCart).toHaveBeenCalledWith({});
    });
  });
});
