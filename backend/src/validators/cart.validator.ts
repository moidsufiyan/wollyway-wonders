import { z } from 'zod';
import { MAX_CART_ITEM_QUANTITY } from '../constants/index.js';

export const cartItemSchema = z.object({
  body: z.object({
    productId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID format')
      .min(1, 'Product ID is required'),
    quantity: z
      .number()
      .int()
      .min(1, 'Quantity must be at least 1')
      .max(MAX_CART_ITEM_QUANTITY, `Maximum ${MAX_CART_ITEM_QUANTITY} units allowed per item`),
  }),
});

export const updateQuantitySchema = z.object({
  body: z.object({
    quantity: z
      .number()
      .int()
      .min(1, 'Quantity must be at least 1')
      .max(MAX_CART_ITEM_QUANTITY, `Maximum ${MAX_CART_ITEM_QUANTITY} units allowed per item`),
  }),
});

export const moveWishlistToCartSchema = z.object({
  body: z.object({
    productId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID format')
      .min(1, 'Product ID is required'),
  }),
});

export const removeCartItemSchema = z.object({
  params: z.object({
    productId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID format')
      .min(1, 'Product ID is required'),
  }),
});
