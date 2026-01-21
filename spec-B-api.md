# Cart API Specification

## Base URL
All endpoints are relative to `/cart`

## Response Format
All endpoints return JSON responses with the following structure:

### Success Response
```json
{
  "success": true,
  "data": <response_data>
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {} // Optional additional error details
  }
}
```

## Data Models

### Money
```json
{
  "amount": 29.99,
  "currency": "USD"
}
```

### LineItem
```json
{
  "itemId": "item_123",
  "sku": "PRODUCT-001",
  "name": "Product Name",
  "price": {
    "amount": 29.99,
    "currency": "USD"
  },
  "quantity": 2,
  "subtotal": {
    "amount": 59.98,
    "currency": "USD"
  }
}
```

### Cart
```json
{
  "cartId": "cart_123",
  "currency": "USD",
  "items": [LineItem],
  "subtotal": Money,
  "tax": Money,
  "total": Money,
  "expiresAt": 1737123456789
}
```

## Endpoints

### 1. Create Cart
Creates a new shopping cart context.

**Endpoint:** `POST /cart/create`

**Request Body:**
```json
{
  "currency": "USD" // Optional, defaults to USD
}
```

**Validation Rules:**
- `currency` (optional): Must be a valid string if provided

**Success Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "cartId": "cart_123",
    "expiresAt": 1737123456789
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid currency format

---

### 2. Get Cart
Retrieves cart details by cart ID.

**Endpoint:** `GET /cart/:cartId`

**Path Parameters:**
- `cartId` (required): String - Cart identifier

**Validation Rules:**
- `cartId`: Required, non-empty string

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": Cart
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid cartId
- `404 Not Found`: Cart not found

---

### 3. Add Item to Cart
Adds a new item to an existing cart.

**Endpoint:** `POST /cart/:cartId/items`

**Path Parameters:**
- `cartId` (required): String - Cart identifier

**Request Body:**
```json
{
  "sku": "PRODUCT-001",
  "name": "Product Name",
  "price": 29.99,
  "quantity": 2
}
```

**Validation Rules:**
- `cartId`: Required, non-empty string
- `sku`: Required, non-empty string
- `name`: Required, non-empty string
- `price`: Required, positive number (> 0)
- `quantity`: Required, positive integer (> 0)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": Cart
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid cartId, sku, name, price, or quantity
- `404 Not Found`: Cart not found
- `500 Internal Server Error`: Service error

---

### 4. Update Item Quantity
Updates the quantity of an existing item in the cart.

**Endpoint:** `PUT /cart/:cartId/items/:itemId`

**Path Parameters:**
- `cartId` (required): String - Cart identifier
- `itemId` (required): String - Item identifier

**Request Body:**
```json
{
  "quantity": 3
}
```

**Validation Rules:**
- `cartId`: Required, non-empty string
- `itemId`: Required, non-empty string
- `quantity`: Required, positive integer (> 0)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": Cart
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid cartId, itemId, or quantity
- `404 Not Found`: Cart or item not found
- `500 Internal Server Error`: Service error

---

### 5. Remove Item from Cart
Removes an item from the cart completely.

**Endpoint:** `DELETE /cart/:cartId/items/:itemId`

**Path Parameters:**
- `cartId` (required): String - Cart identifier
- `itemId` (required): String - Item identifier

**Validation Rules:**
- `cartId`: Required, non-empty string
- `itemId`: Required, non-empty string

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": Cart
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid cartId or itemId
- `404 Not Found`: Cart or item not found
- `500 Internal Server Error`: Service error

## Validation Details

### Common Validation Errors

| Field | Error Condition | Error Message |
|-------|----------------|---------------|
| cartId | Missing or empty | "Cart ID is required" |
| itemId | Missing or empty | "Item ID is required" |
| currency | Invalid type | "Currency must be a valid string" |
| sku | Missing or empty | "SKU is required" |
| name | Missing or empty | "Product name is required" |
| price | Not a number or ≤ 0 | "Price must be a positive number" |
| quantity | Not an integer or ≤ 0 | "Quantity must be a positive integer" |

### Parallel Validation
The following routes perform parallel validation for better performance:
- **Add Item**: Validates `cartId` and request body simultaneously
- **Update Quantity**: Validates `cartId` and `itemId` in parallel, then validates request body
- **Remove Item**: Validates `cartId` and `itemId` simultaneously

## Error Handling
All routes are wrapped with error handling middleware that:
- Catches validation errors and returns appropriate 400 responses
- Catches service errors and returns 500 responses with generic messages
- Ensures consistent error response format

## Notes
- All monetary amounts are represented as decimal numbers
- Cart expiration times are Unix timestamps in milliseconds
- All string parameters are case-sensitive
- Empty strings are treated as invalid for required string fields
