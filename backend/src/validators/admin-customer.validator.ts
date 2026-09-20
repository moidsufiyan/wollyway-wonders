import { z } from 'zod';

export const adminCustomerListQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('20'),
  q: z.string().optional(),
  status: z.enum(['active', 'suspended', 'deactivated']).optional(),
});

export const adminCustomerStatusUpdateSchema = z.object({
  status: z.enum(['active', 'suspended', 'deactivated'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be active, suspended, or deactivated',
  }),
});
