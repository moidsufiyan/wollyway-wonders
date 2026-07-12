import { z } from 'zod';

const imageSchema = z.object({
  url: z.string().url('Image URL must be valid').nullable().optional(),
  publicId: z.string().nullable().optional(),
  alt: z.string().max(150, 'Alt text cannot exceed 150 characters').nullable().optional(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
});

const seoSchema = z.object({
  title: z.string().max(70, 'SEO title cannot exceed 70 characters').nullable().optional(),
  description: z
    .string()
    .max(160, 'SEO description cannot exceed 160 characters')
    .nullable()
    .optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url('Canonical URL must be valid').nullable().optional(),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Category name must have at least 2 characters')
      .max(50, 'Category name cannot exceed 50 characters'),
    description: z
      .string()
      .min(10, 'Category description must have at least 10 characters')
      .max(500, 'Category description cannot exceed 500 characters'),
    image: imageSchema.optional(),
    status: z.enum(['active', 'hidden', 'archived']).optional(),
    sortOrder: z.number().int().optional(),
    featured: z.boolean().optional(),
    seo: seoSchema.optional(),
    parentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID format')
      .nullable()
      .optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Category name must have at least 2 characters')
      .max(50, 'Category name cannot exceed 50 characters')
      .optional(),
    description: z
      .string()
      .min(10, 'Category description must have at least 10 characters')
      .max(500, 'Category description cannot exceed 500 characters')
      .optional(),
    image: imageSchema.optional(),
    status: z.enum(['active', 'hidden', 'archived']).optional(),
    sortOrder: z.number().int().optional(),
    featured: z.boolean().optional(),
    seo: seoSchema.optional(),
    parentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID format')
      .nullable()
      .optional(),
  }),
});
