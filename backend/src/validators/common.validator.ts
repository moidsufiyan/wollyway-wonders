import { z } from 'zod';

export const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const mongoIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid ID format').min(1, 'ID is required'),
  }),
});

export const mongoProductIdParamSchema = z.object({
  params: z.object({
    productId: z
      .string()
      .regex(objectIdRegex, 'Invalid Product ID format')
      .min(1, 'Product ID is required'),
  }),
});
