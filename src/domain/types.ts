export interface Money {
  amount: number;
  currency: string;
}

export interface LineItem {
  itemId: string;
  sku: string;
  name: string;
  price: Money;
  quantity: number;
  subtotal: Money;
}

export interface Cart {
  cartId: string;
  currency: string;
  items: LineItem[];
  subtotal: Money;
  tax: Money;
  total: Money;
  expiresAt: number;
}

export interface SalesforceCartContext {
  cartId: string;
  currency: string;
  items: LineItem[];
  expiresAt: number;
}

// Request/Response types
export interface CreateCartRequest {
  currency?: string;
}

export interface AddItemRequest {
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

export interface UpdateQuantityRequest {
  quantity: number;
}

export interface CreateCartResponse {
  cartId: string;
  expiresAt: number;
}