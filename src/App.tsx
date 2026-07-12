/**
 * MIGRATION NOTE (Milestone 6):
 * This file is the React Router route map from the Vite era.
 * In Next.js App Router, routing is file-based under app/.
 *
 * Route mapping reference:
 *   /                    → app/(public)/page.tsx          (Index)
 *   /shop                → app/(shop)/shop/page.tsx       (Shop)
 *   /product/:id         → app/(shop)/product/[id]/page.tsx (ProductDetail)
 *   /bundles             → app/(shop)/bundles/page.tsx    (Bundles)
 *   /bundle/:id          → app/(shop)/bundle/[id]/page.tsx (BundleDetail)
 *   /cart                → app/(shop)/cart/page.tsx       (Cart)
 *   /checkout            → app/(shop)/checkout/page.tsx   (Checkout)
 *   /checkout-success    → app/(shop)/checkout-success/page.tsx (CheckoutSuccess)
 *   /login               → app/(auth)/login/page.tsx      (Login)
 *   /profile             → app/(account)/profile/page.tsx (Profile)
 *   /wishlist            → app/(account)/wishlist/page.tsx (Wishlist)
 *   /order-tracking      → app/(account)/order-tracking/page.tsx (OrderTracking)
 *   /about               → app/(public)/about/page.tsx    (About)
 *   /contact             → app/(public)/contact/page.tsx  (Contact)
 *   /support             → app/(public)/support/page.tsx  (Support)
 *   /faq                 → app/(public)/faq/page.tsx      (FAQ)
 *   /size-guide          → app/(public)/size-guide/page.tsx (SizeGuidePage)
 *   /privacy-policy      → app/(public)/privacy-policy/page.tsx (PrivacyPolicy)
 *   /terms               → app/(public)/terms/page.tsx    (TermsOfService)
 *   /shipping-policy     → app/(public)/shipping-policy/page.tsx (ShippingPolicy)
 *   /return-policy       → app/(public)/return-policy/page.tsx (ReturnPolicy)
 *   /*                   → app/not-found.tsx              (NotFound)
 *
 * ScrollToTop is no longer needed — Next.js handles scroll restoration natively.
 * This file will be deleted in Milestone 6 once all pages are migrated.
 */

export {};
