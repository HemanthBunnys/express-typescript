import { Request, Response } from 'express';
import { CartService } from '../services/cart.service.js';

export class CartController {
  constructor(private cartService: CartService) {}

  async createCart(req: Request, res: Response): Promise<void> {
    const result = this.cartService.createCart(req.body);
    res.status(201).json(result);
  }

  async getCart(req: Request, res: Response): Promise<void> {
    const cartId = req.params.cartId as string;
    const cart = this.cartService.getCart(cartId);
    res.json(cart);
  }

  async addItem(req: Request, res: Response): Promise<void> {
    const cartId = req.params.cartId as string;
    const cart = this.cartService.addItem(cartId, req.body);
    res.json(cart);
  }

  async updateQuantity(req: Request, res: Response): Promise<void> {
    const cartId = req.params.cartId as string;
    const itemId = req.params.itemId as string;
    const cart = this.cartService.updateQuantity(cartId, itemId, req.body);
    res.json(cart);
  }

  async removeItem(req: Request, res: Response): Promise<void> {
    const cartId = req.params.cartId as string;
    const itemId = req.params.itemId as string;
    const cart = this.cartService.removeItem(cartId, itemId);
    res.json(cart);
  }
}