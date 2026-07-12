# ADR 0003: Redesigning the API Service Layer using the Adapter Pattern

## Context and Problem Statement
Currently, all API mock data and service calls are defined in `src/services/api.ts`. In subsequent phases, this mockup database must transition seamlessly to a MongoDB + Express server. If components contain direct REST queries, refactoring becomes expensive and error-prone.

## Decision
Abstract the API network layer into domain-specific modules inside `src/api/` using the **Adapter Pattern**:
*   *During Migration*: The adapters load and mock data from local JSON files.
*   *During Backend Integration*: The adapters execute HTTP requests (Axios/fetch) to the REST backend.
*   *Rule*: Components only communicate through these adapters without knowing where the data originates.

## Rationale
*   Decoupling elements simplifies backend integration.
*   Prevents logic leaking into presentation components.

## Consequences
*   Requires dividing `services/api.ts` into isolated modules (`auth.api.ts`, `product.api.ts`, `order.api.ts`, `category.api.ts`).
