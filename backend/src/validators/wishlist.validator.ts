import { z } from 'zod';

export const addToWishlistSchema = z.object({
  body: z.object({
    productId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format')
      .min(1, 'Product ID is required'),
  }),
});

export const checkWishlistSchema = z.object({
  params: z.object({
    productId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format')
      .min(1, 'Product ID is required'),
  }),
});

export const removeWishlistSchema = z.object({
  params: z.object({
    productId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format')
      .min(1, 'Product ID is required'),
  }),
});

export const wishlistQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});
