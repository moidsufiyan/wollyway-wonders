/**
 * @file product.query-builder.ts
 * @description Architectural query builder for the Product Discovery domain.
 *
 * This is NOT a utility — it is a domain infrastructure component.
 * Placing it in `src/builders/` establishes the pattern for:
 *   - order.query-builder.ts
 *   - user.query-builder.ts
 *   - admin-product.query-builder.ts
 *
 * Responsibilities (in order):
 *   1. Parse     — read raw ParsedQs into known parameter keys
 *   2. Normalize — lowercase tags/materials, trim, deduplicate
 *   3. Validate  — run Zod schema; throw AppError(400) on failures
 *   4. Build Filter  — construct FilterQuery<IProduct>
 *   5. Build Sort    — map snake_case sort key → Mongoose sort object
 *   6. Build Projection — Product Card DTO fields only
 *   7. Build Pagination — compute skip, enforce limit 1–50
 *   8. Return    — typed BuiltQuery object
 *
 * Has zero Express dependencies — independently testable.
 */

import { FilterQuery } from 'mongoose';
import { ParsedQs } from 'qs';
import { z } from 'zod';
import type { IProduct } from '../models/product.model.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';
import type {
  DiscoveryQueryParams,
  SortOption,
  AvailabilityFilter,
} from '../types/discovery.types.js';

// ---------------------------------------------------------------------------
// Validation Schema
// ---------------------------------------------------------------------------

/**
 * Parses a comma-separated string into an array of normalized strings.
 * Normalization: lowercase, trim, unique. Applied before validation.
 */
const normalizedStringArray = (max: number) =>
  z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const items = val
        .split(',')
        .map((s) => s.toLowerCase().trim())
        .filter((s) => s.length > 0);
      return Array.from(new Set(items)); // deduplicate
    })
    .pipe(z.array(z.string()).max(max, `Maximum ${max} values allowed`).optional());

const SORT_OPTIONS: SortOption[] = [
  'relevance',
  'newest',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
  'featured',
];

const discoverySchema = z
  .object({
    q: z.string().max(100, 'Search query cannot exceed 100 characters').optional(),
    categorySlug: z.string().optional(),
    minPrice: z.coerce.number().min(0, 'minPrice must be non-negative').optional(),
    maxPrice: z.coerce.number().min(0, 'maxPrice must be non-negative').optional(),
    tags: normalizedStringArray(10),
    materials: normalizedStringArray(20),
    availability: z
      .enum(['in_stock', 'all'] as [AvailabilityFilter, AvailabilityFilter])
      .default('in_stock'),
    featured: z
      .string()
      .optional()
      .transform((val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      })
      .pipe(z.boolean().optional()),
    sort: z.enum(SORT_OPTIONS as [SortOption, ...SortOption[]]).default('newest'),
    page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, 'limit must be at least 1')
      .max(50, 'limit cannot exceed 50')
      .default(12),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    { message: 'minPrice cannot be greater than maxPrice', path: ['minPrice'] }
  );

// ---------------------------------------------------------------------------
// Sort Map
// ---------------------------------------------------------------------------

type MongoSortObject = Record<string, 1 | -1>;

const SORT_MAP: Record<SortOption, MongoSortObject> = {
  relevance: { score: -1 }, // Requires $text query; overridden in buildSort if no q
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  // featured: explicitly two-field sort for predictable ordering
  featured: { featured: -1, createdAt: -1 },
};

// ---------------------------------------------------------------------------
// Built Query — output of build()
// ---------------------------------------------------------------------------

export interface BuiltQuery {
  filter: FilterQuery<IProduct>;
  sort: MongoSortObject | { score: { $meta: 'textScore' } };
  projection: Record<string, 1>;
  skip: number;
  limit: number;
  params: DiscoveryQueryParams;
}

// ---------------------------------------------------------------------------
// Product Card DTO Projection
// Fields never returned: seo, createdBy, updatedBy, archivedAt, images (full array)
// ---------------------------------------------------------------------------

const PRODUCT_CARD_PROJECTION: Record<string, 1> = {
  _id: 1,
  name: 1,
  slug: 1,
  shortDescription: 1,
  price: 1,
  salePrice: 1,
  images: 1, // filtered to primaryImage only in the mapper
  featured: 1,
  categoryId: 1,
  visibility: 1,
  materials: 1,
  tags: 1,
};

// ---------------------------------------------------------------------------
// ProductQueryBuilder
// ---------------------------------------------------------------------------

export class ProductQueryBuilder {
  private readonly raw: ParsedQs;

  constructor(raw: ParsedQs) {
    this.raw = raw;
  }

  /**
   * Executes the full pipeline:
   * Parse → Normalize → Validate → Build Filter/Sort/Projection/Pagination
   */
  build(): BuiltQuery {
    // Step 1–3: Parse, Normalize (via schema transforms), Validate
    const parsed = this.parseAndValidate();

    // Step 4: Build Filter
    const filter = this.buildFilter(parsed);

    // Step 5: Build Sort
    const sort = this.buildSort(parsed);

    // Step 6: Projection is static (defined above)
    const projection = PRODUCT_CARD_PROJECTION;

    // Step 7: Build Pagination
    const skip = (parsed.page - 1) * parsed.limit;

    return {
      filter,
      sort,
      projection,
      skip,
      limit: parsed.limit,
      params: parsed,
    };
  }

  // -------------------------------------------------------------------------
  // Private methods
  // -------------------------------------------------------------------------

  private parseAndValidate(): DiscoveryQueryParams {
    const result = discoverySchema.safeParse(this.raw);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      throw new AppError(
        firstIssue?.message ?? 'Invalid query parameters',
        HTTP_STATUS.BAD_REQUEST,
        result.error.issues
      );
    }
    return result.data as DiscoveryQueryParams;
  }

  private buildFilter(params: DiscoveryQueryParams): FilterQuery<IProduct> {
    const filter: FilterQuery<IProduct> = {
      visibility: 'published', // always implicit
    };

    // Keyword search — uses text index
    if (params.q) {
      filter.$text = { $search: params.q };
    }

    // Price range
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      filter.price = {};
      if (params.minPrice !== undefined) filter.price.$gte = params.minPrice;
      if (params.maxPrice !== undefined) filter.price.$lte = params.maxPrice;
    }

    // Tags — OR within same facet ($in), AND across facets
    if (params.tags && params.tags.length > 0) {
      filter.tags = { $in: params.tags };
    }

    // Materials
    if (params.materials && params.materials.length > 0) {
      filter.materials = { $in: params.materials };
    }

    // Featured flag
    if (params.featured === true) {
      filter.featured = true;
    }

    // NOTE: categorySlug and availability=in_stock filters are resolved externally
    // by the ProductService (via Category and Inventory repositories) and injected
    // as { categoryId: ObjectId } and { _id: { $in: [...] } } before the query runs.

    return filter;
  }

  private buildSort(
    params: DiscoveryQueryParams
  ): MongoSortObject | { score: { $meta: 'textScore' } } {
    // Relevance sort requires a $text query. If no q is provided, fall back to newest.
    if (params.sort === 'relevance' && !params.q) {
      return SORT_MAP['newest'];
    }

    if (params.sort === 'relevance' && params.q) {
      // MongoDB text score sort
      return { score: { $meta: 'textScore' } };
    }

    return SORT_MAP[params.sort];
  }
}
