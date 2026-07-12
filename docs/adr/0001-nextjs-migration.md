# ADR 0001: Migration of WollyWay Frontend to Next.js 15 App Router

## Context and Problem Statement
WollyWay is a single-vendor handcrafted e-commerce platform built as a client-rendered SPA using React + Vite. To enhance SEO discoverability, page load performance, layout shifts, dynamic page routing, and prepare the app for scale, the frontend needs to transition to a modern server-rendered framework.

## Decision
Migrate the client-side SPA to Next.js 15 utilizing the App Router framework.

## Rationale
*   **Search Engine Optimization (SEO)**: Server-side rendering (SSR) delivers fully pre-rendered HTML metadata configurations directly to search engine crawlers.
*   **Static & Dynamic Page Routing**: Next.js App Router provides folder-based structures (`app/(group)/route/page.tsx`), loading fallbacks (`loading.tsx`), and error margins (`error.tsx`) natively.
*   **Performance Improvements**: Native fonts (`next/font`) and images (`next/image`) optimization utilities.
*   **Alternative Considered**: Maintaining the Vite SPA structure. Rejected because dynamic product catalog and metadata pre-rendering are highly complex to configure manually in a client-rendered environment.

## Consequences
*   Must resolve SSR build-time errors for browser-specific API globals (`window`, `localStorage`).
*   Requires transitioning from `react-router-dom` dynamic hooks to `next/navigation` equivalents.
