export type InvalidationReason = 'UNPUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK' | 'PRICE_CHANGED';

export interface CartTotalsDTO {
  subtotal: number;
  itemCount: number;
  priceChanged: boolean;
  hasInvalidItems: boolean;
  exceedsMaxSubtotal: boolean;
}

export interface CartItemDTO {
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  priceSnapshot: number;
  currentPrice: number;
  priceDiff: number;
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
  availability: {
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    label: string;
    maxAvailable: number;
  };
  isValid: boolean;
  validationReason?: InvalidationReason;
  addedAt: string;
}

export interface CartDTO {
  _id: string;
  userId: string;
  items: CartItemDTO[];
  totals: CartTotalsDTO;
  updatedAt: string;
}
