# Tech-M Express Cart API

A thin "Experience API" that powers a telecom cart on top of a non-persistent Salesforce cart context. This service owns the HTTP interface and orchestrates cart operations against a Salesforce-like dependency without real Salesforce calls.

## Quick Start

### Prerequisites
- Node.js 20+ or higher
- npm (comes with Node.js)

### Installation & Setup

```bash
# Clone and navigate to project
cd express-typescript

# Install dependencies
npm install

# Build TypeScript
npm run build
```
Please email to hemanthbunny726@gmail.com if you're are looking for POSTMAN collection

### Running the Application

```bash
# Development mode with hot reload
npm run dev
Utilize postman-collection.json to test

# Production mode
npm start

# Health check
curl http://localhost:3001/health
```

### Testing

```bash
# Run all tests
npm test

```

The server runs on port 3001 by default (configurable via `PORT` environment variable).

## API Overview

**Base URL:** `http://localhost:3001/cart`

### Available Endpoints
- `POST /cart/create` - Create new cart
- `GET /cart/:cartId` - Get cart details
- `POST /cart/:cartId/items` - Add item to cart
- `PUT /cart/:cartId/items/:itemId` - Update item quantity
- `DELETE /cart/:cartId/items/:itemId` - Remove item from cart

See [spec-B-api.md](spec-B-api.md) for detailed API documentation.

## Architecture & Design Decisions

### Key Design Principles
- **Thin layered architecture** with clear separation of concerns
- **In-memory storage only** - No database persistence
- **Service-oriented design** with dependency injection
- **Comprehensive validation** with parallel processing where possible
- **Consistent error handling** with typed errors
- **Test-driven development** with extensive test coverage

### Architecture Layers

1. **HTTP Layer (Routes/Controllers)**
   - Lightweight request parsing and response formatting
   - Validation middleware for request shape checking
   - No business logic - delegates to service layer

2. **Service Layer (Business Logic)**
   - Core business rules and validation
   - Orchestrates calls to SalesforceCartClient
   - Handles domain error translation

3. **Client Layer (SalesforceCartClient)**
   - Test double simulating Salesforce cart behavior
   - In-memory context storage with TTL expiry
   - Cart calculations and item management

4. **Domain Layer**
   - Type definitions (Cart, LineItem, Money)
   - Custom error classes with HTTP mapping
   - Pure business logic functions

5. **Infrastructure**
   - Clock abstraction for time-based operations
   - Logging with structured output
   - Error handling middleware

### Key Tradeoffs & Decisions

#### 1. Parallel Validation Strategy
**Decision:** Implement parallel validation for independent fields
- **Pros:** Better performance, especially for complex validation rules
- **Cons:** Additional complexity in middleware setup
- **Implementation:** Routes like "Add Item" validate cartId and request body simultaneously

#### 2. In-Memory Storage with Periodic Cleanup
**Decision:** Use Map<string, SalesforceCartContext> with 40-minute cleanup cycles
- **Pros:** Simple, fast, no external dependencies
- **Cons:** Data lost on restart, not suitable for production scale
- **Alternatives Considered:**
  - Redis: External dependency, overkill for demo
  - File-based storage: Slower, more complex error handling
  - Database: Against project constraints

#### 3. Service-Controller Separation
**Decision:** Routes → Controllers → Services architecture
- **Pros:** Clear separation of concerns, easier testing
- **Cons:** More files/classes for simple operations
- **Rationale:** Follows established patterns, supports future complexity

#### 4. Typed Error System
**Decision:** Custom error classes (ValidationError, NotFoundError, etc.) with HTTP mapping
- **Pros:** Type safety, consistent error responses, centralized handling
- **Cons:** More boilerplate than plain Error objects
- **Alternative:** Generic error objects with metadata

#### 5. Test Double for Salesforce Integration
**Decision:** Complete in-memory simulation with realistic behavior
- **Pros:** Fast tests, no external dependencies, predictable behavior
- **Cons:** May not catch integration issues with real Salesforce
- **Features:** Context expiry, quantity merging, tax calculations

### Validation Strategy
- **Route-level validation:** Request shape and basic type checking
- **Service-level validation:** Business rules and complex constraints
- **Client-level validation:** Data integrity and context management
- **Parallel execution:** Independent validations run simultaneously for performance

### Error Handling Approach
- **Typed errors:** Custom error classes with HTTP status mapping
- **Middleware chain:** Service error logging → Generic error formatting
- **Consistent responses:** All errors return standardized JSON structure
- **Graceful degradation:** Service errors don't crash the application

### Logging Strategy
- **Structured logging:** Contextual information with each log entry
- **Constructor injection:** Logger dependency injected into services
- **Multiple levels:** Info, warn, error with appropriate usage
- **Request tracing:** Cart operations logged with relevant context

## Known Gaps & Limitations

### Production Readiness
- **No authentication/authorization** - All endpoints are public
- **No rate limiting** - Susceptible to abuse
- **No request validation limits** - Could accept extremely large payloads
- **No monitoring/metrics** - No observability beyond basic logging
- **No graceful shutdown** - Process termination may lose data

### Data Management
- **No persistence** - All data lost on application restart
- **No backup/recovery** - Cart data cannot be restored
- **Memory leaks possible** - Cleanup runs every 40 minutes, expired data remains until then
- **No data migration** - Cannot handle schema changes

### Scalability Concerns
- **Single instance only** - No horizontal scaling support
- **Memory constraints** - All data stored in application memory
- **No load balancing** - Cannot distribute traffic across instances
- **Blocking operations** - Some cart operations are synchronous

### Testing Coverage
- **Integration tests missing** - Only unit tests implemented
- **Performance tests absent** - No load/stress testing
- **Edge case coverage incomplete** - Some boundary conditions not tested
- **End-to-end testing missing** - No full workflow validation

### API Limitations
- **No pagination** - Cart items returned as complete list
- **No bulk operations** - Cannot add/update multiple items at once
- **No search/filtering** - Cannot search carts or items
- **No audit trail** - No record of cart modifications

### Security & Compliance
- **No input sanitization** - Potential XSS vulnerabilities in names/descriptions
- **No HTTPS enforcement** - Runs on HTTP only
- **No CORS configuration** - May have cross-origin issues
- **No data encryption** - All data stored in plain text

### Operational Concerns
- **No health checks** - Basic endpoint only, no deep health validation
- **No configuration management** - Hard-coded values, no environment-specific configs
- **No deployment automation** - Manual deployment process
- **No rollback strategy** - No way to revert problematic deployments

## Development Notes

### File Structure
```
src/
├── app.ts              # Express app setup and DI
├── server.ts           # HTTP server startup
├── controllers/        # HTTP request/response handling
├── services/           # Business logic implementation
├── clients/            # External service simulation
├── routes/             # Route definitions and middleware
├── middlewares/        # Request processing middleware
├── domain/             # Types and error definitions
├── constants/          # Shared constants and messages
└── utils/              # Utility functions and abstractions
```

### Test Structure
```
tests/
├── setup.ts            # Global test configuration
└── unit/
    └── routes/         # Route-level test suites
```

### Key Dependencies
- **express ^5.2.1** - HTTP framework
- **typescript ^5.9.3** - Type system
- **jest ^30.2.0** - Testing framework
- **supertest ^7.2.2** - HTTP testing utilities
- **nodemon ^3.1.11** - Development hot reload

This implementation prioritizes correctness, clarity, and testability over production polish, making it suitable for demonstration and learning purposes while highlighting areas that would need enhancement for production use.
