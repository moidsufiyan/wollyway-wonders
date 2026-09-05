import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  body: z
    .object({
      provider: z.enum(['razorpay', 'stripe'], {
        required_error: 'Payment provider is required.',
        invalid_type_error: "Provider must be either 'razorpay' or 'stripe'.",
      }),
    })
    .strict(),
});

export type CreatePaymentIntentDTO = z.infer<typeof createPaymentIntentSchema>['body'];
