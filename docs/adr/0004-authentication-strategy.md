# ADR 0004: Client-Side Route Protection During Migration Phase

## Context and Problem Statement
Next.js App Router provides Edge Middleware (`middleware.ts`) to handle server-side redirects and route protections. However, in the migration phase, real backend authentication and JWT cookies do not exist yet.

## Decision
Retain client-side authentication gates inside page mounts during the migration phase, and implement a dummy pass-through skeleton at `src/middleware.ts` for future JWT checking.

## Rationale
*   Ensures 1:1 behavioral parity during the initial migration.
*   Avoids implementing redundant dummy redirection login gates inside middleware that would be thrown away later.

## Consequences
*   Client pages must continue to handle unauthenticated state redirecting on load.
*   Middleware intercepts requests but resolves as a pass-through in this phase.
