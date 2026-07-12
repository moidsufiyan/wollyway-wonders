import { z } from 'zod';

export const adjustInventorySchema = z.object({
  body: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
    change: z
      .number({ required_error: 'Stock change quantity is required' })
      .int('Stock change must be an integer')
      .refine((val) => val !== 0, 'Stock change cannot be zero'),
    reason: z.enum(['manual', 'purchase', 'return', 'damage', 'audit', 'correction', 'shrinkage'], {
      errorMap: () => ({ message: 'Invalid stock adjustment reason' }),
    }),
    notes: z.string().max(250, 'Notes cannot exceed 250 characters').nullable().optional(),
  }),
});

export const updateInventorySettingsSchema = z.object({
  body: z.object({
    lowStockThreshold: z
      .number()
      .int('Threshold must be an integer')
      .min(0, 'Threshold cannot be negative')
      .optional(),
    trackInventory: z.boolean().optional(),
  }),
});
