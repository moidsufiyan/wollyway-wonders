/**
 * @file product.mapper.ts
 * @description Centralized DTO transformation logic for the Product domain.
 *
 * All transformations from IProduct → ProductCardDTO live here.
 * When the DTO shape evolves, this is the single file to change.
 * The service layer never performs inline mapping.
 */

import { Types } from 'mongoose';
import type { IProduct } from '../models/product.model.js';
import type {
  ProductCardDTO,
  AvailabilityInfo,
  AvailabilityStatus,
} from '../types/discovery.types.js';

export class ProductMapper {
  /**
   * Maps a raw IProduct document to a lean ProductCardDTO.
   *
   * @param product - The raw Mongoose document (can be lean plain object)
   * @param categoryInfo - Resolved category name + slug (passed from service to avoid N+1 query)
   * @param availabilityInfo - Resolved availability object from Inventory domain
   */
  static toCardDTO(
    product: IProduct,
    categoryInfo: { _id: Types.ObjectId; name: string; slug: string } | null,
    availabilityInfo: AvailabilityInfo
  ): ProductCardDTO {
    // Find the single primary image
    const primaryImage = (product.images ?? []).find((img) => img.isPrimary) ?? null;

    return {
      _id: (product._id as Types.ObjectId).toString(),
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      price: product.price,
      salePrice: product.salePrice,
      primaryImage: primaryImage
        ? {
            url: primaryImage.url,
            alt: primaryImage.alt,
            width: primaryImage.width,
            height: primaryImage.height,
          }
        : null,
      featured: product.featured,
      category: categoryInfo
        ? {
            _id: categoryInfo._id.toString(),
            name: categoryInfo.name,
            slug: categoryInfo.slug,
          }
        : null,
      availability: availabilityInfo,
    };
  }

  /**
   * Resolves the availability label for display on the frontend.
   * Centralizing this logic means LOW_STOCK, PRE_ORDER etc. have
   * a single source of truth for their user-facing labels.
   */
  static resolveAvailability(productId: Types.ObjectId, inStockIds: Set<string>): AvailabilityInfo {
    const idStr = productId.toString();
    const status: AvailabilityStatus = inStockIds.has(idStr) ? 'IN_STOCK' : 'OUT_OF_STOCK';

    const LABELS: Record<AvailabilityStatus, string> = {
      IN_STOCK: 'In Stock',
      LOW_STOCK: 'Low Stock',
      OUT_OF_STOCK: 'Out of Stock',
    };

    return { status, label: LABELS[status] };
  }
}
