export type AvailabilityStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface AvailabilityInfo {
  status: AvailabilityStatus;
  label: string;
}

export interface WishlistCardDTO {
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  primaryImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
  } | null;
  category: {
    name: string;
    categorySlug: string;
  } | null;
  availability: AvailabilityInfo;
  addedAt: string;
}

export interface WishlistPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface WishlistResponse {
  success: boolean;
  pagination: WishlistPagination;
  products: WishlistCardDTO[];
}
