You are helping me implement a service as per the below requirement.

Context:
I am building a thin “Experience API” for a telecom cart that sits on top of a non-persistent Salesforce cart context.
There must be no real Salesforce calls and no database.
All state must be in memory and cart contexts must expire.

Constraints:
- Language: TypeScript
- Runtime: Node (20+)
- Minimal HTTP framework (Express is fine)
- Use in-memory data structures only
- Implement a SalesforceCartClient test double with realistic behavior and context expiry
- Correctness and clarity matter more than production polish

Use the following specifications as the single source of truth.
Do not invent new endpoints or behaviors beyond what is written.

Analyze files: SPEC-A-architecture.md, spec-B-api.md


Task:
1. Generate a basic Express + TypeScript project structure.
2. Implement routes, controllers, services, domain types, middlewares and a SalesforceCartClient according to the specs.
3. Use typed errors and centralized error handling.
4. Do not add authentication, persistence, or external dependencies.
5. Keep the code readable and straightforward.

Return only code. No explanations.

## Additional Improvements made from the BELOW contexts ##

Refactor the existing implementation so that:
- All request validation happens in Express middleware
- Controllers only extract params/body and call services
- Validation errors are thrown as typed errors and handled by the error middleware
- Each route has a single, readable validation middleware instead of long chains

Remove repetitive try/catch blocks from services.
Let errors bubble up naturally and handle them in a centralized Express error middleware.
Preserve typed error behavior and HTTP status mapping.

Improve SalesforceCartClient so that:
- Cart contexts expire based on a TTL
- Expired contexts throw a ContextExpiredError
- Adding the same SKU merges quantities instead of creating duplicates
- Totals (subtotal, tax, total) are computed on reads
- Use an injected Clock abstraction to make expiry testable

Introduce a small Logger abstraction with info/warn/error methods.
Inject the logger into services via constructor injection.
Avoid logging inside controllers or routes.

Using Jest and Supertest, add a unit test for POST /cart/create.
The SalesforceCartClient should be mocked so no real cart logic runs.
Focus on a single happy-path test.


## NOTES - DECISIONS / IMPROVEMENTS ##

1. create two files with names "spec-A-architecture.md", "spec-B-api.md" at root level.
2. Created a proper package.json and tsconfig.json (Played along with AI and also Google Citations to add / remove necessary - unwanted rules and fields)
3. Leading the design in creating individual Routes, Controllers, Domains, Services, Clients and middlewares required. This will allow us to scale in future.
4. Done an assignment to identify what are all the types & interfaces might be required for this specific scenario. Spent time on identifying the fields which needed strict validations
5. Took a decision to avoid major validations after entering into controller layer. Defined required middlewares for logging, error handling and schema validations.
6. Once everything is defined, Moved all the hard-coded details such as error messages, exception messages, success messages to a constant file for reusability.
7. We can eliminate Map operations of get, set, find, etc in Client layer and can build a extended layer in future if we want to scale with caching mechanisms etc.
8. From the current implementation, routes are directly calling service operations, I engaged the call flow in a way where routes should call controllers and in turn, controller should call the service. Controller is responsible for extracting the request params or body information before passing it into the service
9. Eliminate passing multiple number of middlewares to routs. Created an individual middlewares for individual routes. Defined asynchronous middlewares so that we can execute parallely if there's no concurrant dependancy on fields
10. Maintained a common unique ID consists of only digits for consistency.
11. Only defined test-cases for creation & updation because from business & coding perspective, those are critical routes.
12. Maintained strict type at majority of places but still there's a room for improvement
13. Assumed session time as 40 min, Defined a cleanup operation which will wipe out all the key, value in Map if they are expired. There's a chance of GC issues if the application faces any issue in the range of 40 min and the process unable to clean-up the memory.
14. Defined a very basic logger class for understanding the flow by tracing the logs at terminal
15. Removed all the exception handling at controllers, services and client which is a risky step but if we define clear and proper middlewares, we can tackle errors along with improved code.
16. Utilized jest for the specs and supertest to simulate the real request scenarios.

