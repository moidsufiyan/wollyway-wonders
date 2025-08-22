// Centralized Product type definition
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  colors: string[];
  tags: string[];
  category: string;
  rating: number;
  description?: string;
  brand?: string;
  featured?: boolean;
  countInStock?: number;
  numReviews?: number;
  discount?: number;
  reviews?: Array<{
    id: string;
    user: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
};

// Legacy compatibility - map old property names to new ones
export const normalizeProduct = (product: any): Product => {
  return {
    ...product,
    id: String(product.id || product._id),
    countInStock: product.countInStock || product.stockCount || product.stock || 0,
    featured: product.featured || product.isFeatured || false,
    numReviews: product.numReviews || (Array.isArray(product.reviews) ? product.reviews.length : product.reviews) || 0,
  };
};