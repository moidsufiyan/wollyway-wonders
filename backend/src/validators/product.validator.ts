import { z } from 'zod';

const imageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  publicId: z.string().min(1, 'Public ID is required'),
  alt: z.string().optional().default(''),
  width: z.number().int().min(1, 'Width must be positive'),
  height: z.number().int().min(1, 'Height must be positive'),
  isPrimary: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    slug: z
      .string()
      .regex(
        /^[a-z0-9-]+$/,
        'Slug must only contain lowercase alphanumeric characters and hyphens'
      ),
    shortDescription: z.string().max(200).optional(),
    description: z.string().optional(),
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),

    price: z.number().int('Price must be an integer (in cents)').min(0),
    salePrice: z.number().int('Sale price must be an integer (in cents)').min(0).optional(),

    images: z.array(imageSchema).max(10, 'Maximum 10 images allowed').optional(),

    materials: z.array(z.string()).optional(),
    careInstructions: z.string().optional(),
    dimensions: z
      .object({
        length: z.number().min(0),
        width: z.number().min(0),
        height: z.number().min(0),
        unit: z.enum(['cm', 'in']),
      })
      .optional(),
    weight: z
      .object({
        value: z.number().min(0),
        unit: z.enum(['g', 'kg', 'oz', 'lb']),
      })
      .optional(),

    isCustomizable: z.boolean().optional(),
    estimatedProductionDays: z.number().int().min(0).optional(),

    tags: z
      .array(z.string().max(30, 'Tags cannot exceed 30 characters'))
      .max(15, 'Maximum 15 tags allowed')
      .optional(),
    featured: z.boolean().optional(),
    visibility: z.enum(['draft', 'published', 'hidden', 'archived']).optional(),

    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        canonicalUrl: z.string().url().optional(),
      })
      .optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100).optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
      .optional(),
    shortDescription: z.string().max(200).optional(),
    description: z.string().optional(),
    categoryId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format')
      .optional(),

    price: z.number().int('Price must be an integer (in cents)').min(0).optional(),
    salePrice: z.number().int('Sale price must be an integer (in cents)').min(0).optional(),

    images: z.array(imageSchema).max(10, 'Maximum 10 images allowed').optional(),

    materials: z.array(z.string()).optional(),
    careInstructions: z.string().optional(),
    dimensions: z
      .object({
        length: z.number().min(0),
        width: z.number().min(0),
        height: z.number().min(0),
        unit: z.enum(['cm', 'in']),
      })
      .optional(),
    weight: z
      .object({
        value: z.number().min(0),
        unit: z.enum(['g', 'kg', 'oz', 'lb']),
      })
      .optional(),

    isCustomizable: z.boolean().optional(),
    estimatedProductionDays: z.number().int().min(0).optional(),

    tags: z.array(z.string().max(30)).max(15).optional(),
    featured: z.boolean().optional(),
    visibility: z.enum(['draft', 'published', 'hidden', 'archived']).optional(),

    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        canonicalUrl: z.string().url().optional(),
      })
      .optional(),
  }),
});

export const addImageSchema = z.object({
  body: z.object({
    images: z
      .array(imageSchema)
      .min(1, 'Provide at least one image')
      .max(10, 'Cannot add more than 10 images in one batch'),
  }),
});
