# ADR 0002: Separation of Client, Server, and UI State Management

## Context and Problem Statement
To keep components decoupled and prevent context re-renders, different state domains must follow clear architecture boundaries.

## Decision
Enforce the following separation of state concerns:
1. **Server State**: Managed by **TanStack Query** (React Query) for API/backend data caching and fetching.
2. **Client State**: Managed by **Zustand** for complex global client state (e.g. settings parameters, dynamic states).
3. **Global UI State**: Managed by standard **React Context** (lightweight states like Theme, cart/wishlist local storage context setups).

## Rationale
*   Decoupled states prevent local re-renders on page elements.
*   Zustand provides a lightweight, action-based interface without requiring DOM-level wrapper trees.
*   TanStack Query handles caching, stale-while-revalidate, retry, and query invalidation automatically.

## Consequences
*   Must ensure Zustand stores are initialized safely on the client to avoid server-client state mismatch errors.
