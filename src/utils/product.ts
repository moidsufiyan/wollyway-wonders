/**
 * WollyWay — Product URL & Navigation Helpers
 */

export interface ProductLinkCandidate {
  slug?: string | unknown;
  id?: string | number | unknown;
  _id?: string | unknown;
}

/**
 * Safely generates a product link URL from a Product or product-like object.
 * Guarantees that neither undefined, null, nor '[object Object]' is ever interpolated into the URL path.
 */
export function getProductUrl(product: ProductLinkCandidate | null | undefined): string {
  if (!product || typeof product !== 'object') {
    return '/shop';
  }

  const slug =
    typeof product.slug === 'string' && product.slug.trim() && product.slug !== '[object Object]'
      ? product.slug.trim()
      : null;

  const id =
    typeof product.id === 'string' && product.id.trim() && product.id !== '[object Object]'
      ? product.id.trim()
      : typeof product.id === 'number'
      ? String(product.id)
      : typeof product._id === 'string' && product._id.trim() && product._id !== '[object Object]'
      ? product._id.trim()
      : null;

  const identifier = slug || id;
  if (!identifier) {
    return '/shop';
  }

  return `/product/${encodeURIComponent(identifier)}`;
}
