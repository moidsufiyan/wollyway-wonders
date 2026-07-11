import { z } from 'zod';

const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must have at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s.-]+$/, 'Name can only contain letters, spaces, dots, and hyphens')
      .optional(),
    phone: z
      .string()
      .regex(E164_PHONE_REGEX, 'Phone number must be in E.164 format (e.g. +919876543210)')
      .optional()
      .nullable(),
    avatar: z
      .object({
        url: z.string().url('Avatar url must be a valid Cloudinary link').nullable(),
        publicId: z.string().nullable(),
      })
      .optional(),
    preferences: z
      .object({
        newsletter: z.boolean().optional(),
        marketingEmails: z.boolean().optional(),
        language: z.string().optional(),
        currency: z.string().optional(),
      })
      .optional(),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    label: z.enum(['Home', 'Work', 'Office', 'Other'], {
      errorMap: () => ({ message: "Label must be 'Home', 'Work', 'Office', or 'Other'" }),
    }),
    customLabel: z
      .string()
      .max(30, 'Custom label cannot exceed 30 characters')
      .optional()
      .nullable(),
    streetAddress: z.string().min(1, 'Street address is required').max(100),
    apartmentSuite: z.string().max(50).optional().nullable(),
    city: z.string().min(1, 'City is required').max(50),
    state: z.string().min(1, 'State is required').max(50),
    postalCode: z
      .string()
      .min(3, 'Postal code must have at least 3 characters')
      .max(10, 'Postal code cannot exceed 10 characters'),
    country: z.string().min(1, 'Country is required').max(50).default('India'),
    phone: z
      .string()
      .regex(
        E164_PHONE_REGEX,
        'Address contact phone must be in E.164 format (e.g. +919876543210)'
      ),
    isDefault: z.boolean().optional().default(false),
  }),
});
