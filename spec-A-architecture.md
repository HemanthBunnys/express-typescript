# SPEC-A-architecture.md

## Purpose
Build a thin “Experience API” that powers a telecom cart on top of a **non-persistent Salesforce cart context**. This service owns the HTTP interface and orchestrates cart operations against a Salesforce-like dependency **without real Salesforce calls**.

The system must be small, cohesive, and testable. Use in-memory state only (no DB).

## Key Constraints (Must Follow)
- Language: TypeScript on Node 22.
- Use a minimal HTTP framework (Express is used).
- **No real Salesforce calls.**
- Implement a **SalesforceCartClient test double** with realistic behavior, including **context expiry**.
- **No database.** Use in-memory stores and pure functions where possible.
- Correctness and clarity over production polish.

## High-Level Architecture
Layering (thin and explicit):
1) **HTTP Layer (Routes/Controllers)**
   - Parse/validate request basics
   - Call service layer
   - Return JSON responses and HTTP status codes
   - No business logic beyond request shape validation

2) **Service Layer (Use Cases)**
   - Owns business rules (validation, idempotent-ish behaviors where needed)
   - Orchestrates calls to SalesforceCartClient
   - Translates domain errors into app errors (or throws typed errors handled centrally)

3) **SalesforceCartClient (Test Double)**
   - In-memory simulation of Salesforce cart context
   - Owns context lifecycle (create context, expiry enforcement)
   - Supports cart operations (get cart, add item, update qty, remove item)
   - Computes cart totals (simple subtotal/tax/total) to behave realistically

4) **Domain**
   - Types: Cart, LineItem, Money, errors
   - “Pure” calculations where possible (totals)

5) **Infrastructure Utilities**
   - `Clock` abstraction (system clock in runtime, fake clock for tests)
   - Error handling middleware for consistent API error responses

## Modules and Responsibilities

### `src/app.ts`
- Express app setup: JSON body parser, routes, error handler.
- Wire the dependencies as Dependency Injection

### `src/server.ts`
- Starts HTTP server on PORT (default 3001).

### `src/routes/*`
- Route definitions for cart operations.
- Should be thin: call service methods and return result.
- No direct mutation of in-memory maps here.

### `src/services/cart.service.ts`
- Implements the Experience API use-cases:
  - create cart context
  - get cart
  - add item
  - update quantity
  - remove item
- Validates inputs (required fields, quantity > 0, numeric checks).
- Generates item IDs (UUID) when adding new items.
- Delegates persistence and expiry enforcement to SalesforceCartClient.

### `src/clients/SalesforceCartClient.ts` (Test Double)
The “Salesforce” boundary is simulated here. Requirements:
- Stores cart contexts in memory keyed by `cartId`.
- Each context has:
  - `cartId`
  - `expiresAt` (epoch ms)
  - currency
  - list of line items
- Enforces expiry:
  - On each operation, if `now() > expiresAt`, throw `ContextExpiredError`.
- Realistic-ish behavior:
  - If adding the same SKU again, merge quantities (common cart behavior).
  - `getCart` computes subtotal/tax/total.
- No networking. No external calls.

### `src/domain/*`
- `types.ts`: Money, Cart, LineItem, request shapes
- `errors.ts`: typed errors with HTTP mapping:
  - `ValidationError` → 400
  - `NotFoundError` → 404
  - `ContextExpiredError` → 410
  - fallback → 500

### `src/utils/clock.ts`
- `Clock` interface `{ now(): number }`
- `systemClock` implementation uses `Date.now()`

## Data Model (In-Memory)
- Context store:
  - `Map<CartId, SalesforceCartContext>`
- Context expiry:
  - Default TTL: 15 minutes (configurable via constructor)
- Item identity:
  - `itemId` generated on add (UUID)
  - `sku` used for merge-on-add behavior (optional but recommended)

## Error Strategy
Use typed errors (recommended) and a single Express error middleware to serialize errors consistently.

Error response shape:
```json
{
  "code": "CONTEXT_EXPIRED",
  "message": "Cart context expired",
  "details": { "cartId": "...", "expiredAt": 123 }
}
