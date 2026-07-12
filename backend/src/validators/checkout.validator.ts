import { z } from 'zod';

export const confirmCheckoutSchema = z.object({
  headers: z
    .object({
      'idempotency-key': z
        .string({
          required_error: 'Idempotency-Key header is required',
        })
        .min(1, 'Idempotency-Key cannot be empty'),
    })
    .passthrough(),
  body: z.object({
    paymentProvider: z.enum(['stripe', 'razorpay', 'cod'], {
      required_error: 'Payment provider is required',
    }),
  }),
});
