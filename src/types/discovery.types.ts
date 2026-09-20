export type AvailabilityStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface AvailabilityInfo {
  status: AvailabilityStatus;
  label: string;
}

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

export type SortOption =
  | 'relevance'
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'featured';

export type AvailabilityFilter = 'in_stock' | 'all';

export interface DiscoveryQueryParams {
  q?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  materials?: string[];
  availability?: AvailabilityFilter;
  featured?: boolean;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

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

export interface ImageDTO {
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductDetailDTO {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  salePrice?: number;
  images: ImageDTO[];
  materials: string[];
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
  isCustomizable: boolean;
  estimatedProductionDays?: number;
  tags: string[];
  featured: boolean;
  categoryId: string;
  // When populated by the backend, categoryId is replaced with a full category object.
  category?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
}
