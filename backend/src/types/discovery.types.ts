/**
 * @file discovery.types.ts
 * @description TypeScript contracts for the Product Discovery domain (Phase 3.5).
 * All types used by the Query Builder, Repository, Mapper, Service, and Controller
 * are co-located here so changes to the discovery shape have a single source of truth.
 */

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export type AvailabilityStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface AvailabilityInfo {
  status: AvailabilityStatus;
  label: string;
}

// ---------------------------------------------------------------------------
// Product Card DTO
// The lean projection returned from the discovery endpoint.
// Never exposes seo, admin audit fields, full image array, or inventory numbers.
// ---------------------------------------------------------------------------

export interface ProductCardDTO {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  primaryImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
  } | null;
  featured: boolean;
  category: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  availability: AvailabilityInfo;
}

// ---------------------------------------------------------------------------
// Discovery Query Params
// The validated + normalized shape produced by the Query Builder.
// ---------------------------------------------------------------------------

export type SortOption =
  'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'featured';

export type AvailabilityFilter = 'in_stock' | 'all';

export interface DiscoveryQueryParams {
  q?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  materials?: string[];
  availability: AvailabilityFilter;
  featured?: boolean;
  sort: SortOption;
  page: number;
  limit: number;
}

// ---------------------------------------------------------------------------
// Discovery Result
// The full JSON response shape sent to the client.
// ---------------------------------------------------------------------------

export interface DiscoveryPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface DiscoveryFilters {
  categorySlug?: string;
  price?: { min?: number; max?: number };
  tags?: string[];
  materials?: string[];
  availability: AvailabilityFilter;
  featured?: boolean;
}

export interface DiscoveryResult {
  success: true;
  results: number;
  query: { q?: string };
  pagination: DiscoveryPagination;
  filters: DiscoveryFilters;
  sort: SortOption;
  products: ProductCardDTO[];
}
