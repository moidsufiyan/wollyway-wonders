import { ProductCardDTO, ProductDetailDTO } from './discovery.types';
import { CartItemDTO } from './cart.types';
import { WishlistCardDTO } from './wishlist.types';

// UI-facing Product View Model
export type Product = {
  // Real backend fields
  id: string; // mapped from _id
  slug: string;
  name: string;
  price: number; // in paisa, UI will format it
  salePrice?: number;
  image: string; // mapped from primaryImage.url
  images?: string[]; // mapped from all images
  tags: string[];
  category: string; // category name or id
  featured: boolean;
  
  // Detail fields
  description?: string;
  shortDescription?: string;
  materials?: string[];
  careInstructions?: string;

  // Availability / Stock info (mapped from backend AvailabilityInfo)
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  stockCount?: number; // legacy UI compat, backend does not expose exact count yet (treat 0 as out of stock, >0 as in stock)

  // --- UI Compatibility Fields (Legacy / Future Features) ---
  // These fields do not exist on the current backend contract and will be undefined.
  // The UI components should gracefully handle their absence.
  colors?: string[];
  sizes?: string[];
  rating?: number;
  reviews?: Array<{
    id: string;
    user: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  numReviews?: number;
  isNew?: boolean; // We could derive this from createdAt if needed
};

// Adapter: Maps backend ProductCardDTO to frontend UI Product
export const mapProductCardToUI = (dto: ProductCardDTO): Product => {
  // Derive legacy stock count to keep UI badges working smoothly if they rely on it
  let simulatedStockCount = 10;
  if (dto.availability.status === 'OUT_OF_STOCK') simulatedStockCount = 0;
  else if (dto.availability.status === 'LOW_STOCK') simulatedStockCount = 3;

  return {
    id: dto._id,
    slug: dto.slug,
    name: dto.name,
    price: dto.price,
    salePrice: dto.salePrice,
    image: dto.primaryImage?.url || '/images/placeholder.jpg',
    category: dto.category?.name || 'Uncategorized',
    tags: [], // ProductCardDTO doesn't return tags by default, kept for UI type safety
    featured: dto.featured,
    stockStatus: dto.availability.status,
    stockCount: simulatedStockCount,
    
    // UI fields explicitly undefined
    colors: undefined,
    sizes: undefined,
    rating: undefined,
    numReviews: undefined,
  };
};

// Adapter: Maps backend ProductDetailDTO to frontend UI Product
export const mapProductDetailToUI = (dto: ProductDetailDTO): Product => {
  return {
    id: dto._id,
    slug: dto.slug,
    name: dto.name,
    price: dto.price,
    salePrice: dto.salePrice,
    image: dto.images.find(img => img.isPrimary)?.url || dto.images[0]?.url || '/images/placeholder.jpg',
    images: dto.images.sort((a, b) => a.displayOrder - b.displayOrder).map(img => img.url),
    category: dto.categoryId, // Note: The detail endpoint returns categoryId, not populated category object.
    tags: dto.tags,
    featured: dto.featured,
    description: dto.description,
    shortDescription: dto.shortDescription,
    materials: dto.materials,
    careInstructions: dto.careInstructions,
    
    // Since detail API doesn't run through the discovery query builder, it lacks availability info.
    // We assume IN_STOCK unless we know otherwise, or we rely on a separate inventory check (future).
    stockStatus: 'IN_STOCK',
    stockCount: 10,
    
    // UI fields explicitly undefined
    colors: undefined,
    sizes: undefined,
    rating: undefined,
    numReviews: undefined,
  };
};

// Adapter: Maps backend CartItemDTO to frontend UI Product
export const mapCartItemToUI = (dto: CartItemDTO): Product => {
  let simulatedStockCount = 10;
  if (dto.availability.status === 'OUT_OF_STOCK') simulatedStockCount = 0;
  else if (dto.availability.status === 'LOW_STOCK') simulatedStockCount = 3;

  return {
    id: dto.productId, // Map productId to standard id
    slug: dto.slug,
    name: dto.name,
    price: dto.currentPrice, // The frontend UI renders currentPrice
    image: dto.primaryImage?.url || '/images/placeholder.jpg',
    category: dto.category?.name || 'Uncategorized',
    tags: [],
    featured: false, // Not returned in CartItemDTO
    stockStatus: dto.availability.status,
    stockCount: simulatedStockCount,
    
    colors: undefined,
    sizes: undefined,
    rating: undefined,
    numReviews: undefined,
  };
};

// Adapter: Maps backend WishlistCardDTO to frontend UI Product
export const mapWishlistCardToUI = (dto: WishlistCardDTO): Product => {
  let simulatedStockCount = 10;
  if (dto.availability.status === 'OUT_OF_STOCK') simulatedStockCount = 0;
  else if (dto.availability.status === 'LOW_STOCK') simulatedStockCount = 3;

  return {
    id: dto.productId, // Map productId to standard id
    slug: dto.slug,
    name: dto.name,
    price: dto.price,
    salePrice: dto.salePrice,
    image: dto.primaryImage?.url || '/images/placeholder.jpg',
    category: dto.category?.name || 'Uncategorized',
    tags: [],
    featured: false,
    stockStatus: dto.availability.status,
    stockCount: simulatedStockCount,
    
    colors: undefined,
    sizes: undefined,
    rating: undefined,
    numReviews: undefined,
  };
};

// Legacy compatibility for any remaining mock data that still uses the old format directly
export const normalizeProduct = (product: any): Product => {
  return {
    ...product,
    id: product.id ?? product._id ?? String(product.id || product._id),
    stockCount: product.countInStock || product.stockCount || product.stock || 0,
    featured: product.featured || product.isFeatured || false,
    numReviews: product.numReviews || (Array.isArray(product.reviews) ? product.reviews.length : product.reviews) || 0,
    price: typeof product.price === 'number' && product.price < 1000 ? product.price * 100 : product.price // Convert old mock prices to paisa if they were in rupees
  };
};