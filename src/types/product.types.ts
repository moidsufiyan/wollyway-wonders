/**
 * Admin Product DTO types — mirrors the backend admin-product.types.ts contracts.
 * These types are separate from the public ProductCardDTO to include
 * admin-only fields: visibility, createdAt, updatedAt.
 */

export type ProductVisibility = 'draft' | 'published' | 'hidden' | 'archived';

export type AdminProductSortOption =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc';

export interface AdminProductImageDTO {
  url: string;
  alt: string;
  width: number;
  height: number;
}

/** Full image record exposed to admin — includes publicId, isPrimary, displayOrder */
export interface AdminProductDetailImageDTO {
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
  isPrimary: boolean;
  displayOrder: number;
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

/** Card DTO returned by the list endpoint (primary image only) */
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

/** Full detail DTO returned by GET /admin/products/:id — includes all images */
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

export interface AdminProductQueryParams {
  q?: string;
  visibility?: 'all' | ProductVisibility;
  featured?: boolean;
  sort?: AdminProductSortOption;
  page?: number;
  limit?: number;
}

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
    visibility?: 'all' | ProductVisibility;
    featured?: boolean;
  };
  sort: AdminProductSortOption;
  products: AdminProductCardDTO[];
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  categoryId: string;
  price: number;
  salePrice?: number;
  materials?: string[];
  careInstructions?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  weight?: {
    value: number;
    unit: 'g' | 'kg' | 'oz' | 'lb';
  };
  isCustomizable?: boolean;
  estimatedProductionDays?: number;
  tags?: string[];
  featured?: boolean;
  visibility?: ProductVisibility;
}

export type UpdateProductPayload = Partial<CreateProductPayload> & {
  /** Full image array — used to update isPrimary and displayOrder */
  images?: Array<{
    url: string;
    publicId: string;
    alt: string;
    width: number;
    height: number;
    isPrimary: boolean;
    displayOrder: number;
  }>;
};
