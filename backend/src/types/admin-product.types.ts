/**
 * @file admin-product.types.ts
 * @description TypeScript contracts for the Admin Product Listing domain.
 *
 * These types are separate from the public Discovery DTO to allow
 * admin-specific fields (visibility, audit dates, inventory) to be added
 * without polluting the customer-facing ProductCardDTO contract.
 */

export type ProductVisibility = 'draft' | 'published' | 'hidden' | 'archived';

export type AdminProductSortOption =
  'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

// ---------------------------------------------------------------------------
// Admin Product Card DTO
// Extends the public ProductCardDTO shape with admin-only fields.
// ---------------------------------------------------------------------------

export interface AdminProductImageDTO {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface AdminProductCategoryDTO {
  _id: string;
  name: string;
  slug: string;
}

export interface AdminProductAvailabilityDTO {
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  label: string;
}

export interface AdminProductCardDTO {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  primaryImage: AdminProductImageDTO | null;
  featured: boolean;
  visibility: ProductVisibility;
  category: AdminProductCategoryDTO | null;
  availability: AdminProductAvailabilityDTO;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Admin Product Detail DTO (for single product edit view — includes all images)
// ---------------------------------------------------------------------------

export interface AdminProductDetailImageDTO {
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
  isPrimary: boolean;
  displayOrder: number;
}

export interface AdminProductDetailDTO {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  salePrice?: number;
  images: AdminProductDetailImageDTO[];
  materials: string[];
  careInstructions?: string;
  isCustomizable: boolean;
  estimatedProductionDays?: number;
  tags: string[];
  featured: boolean;
  visibility: ProductVisibility;
  category: AdminProductCategoryDTO | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Query Params
// ---------------------------------------------------------------------------

export interface AdminProductQueryParams {
  q?: string;
  visibility?: ProductVisibility | 'all';
  featured?: boolean;
  sort?: AdminProductSortOption;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Paginated Response
// ---------------------------------------------------------------------------

export interface AdminProductListResult {
  success: true;
  results: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  filters: {
    q?: string;
    visibility?: ProductVisibility | 'all';
    featured?: boolean;
  };
  sort: AdminProductSortOption;
  products: AdminProductCardDTO[];
}
