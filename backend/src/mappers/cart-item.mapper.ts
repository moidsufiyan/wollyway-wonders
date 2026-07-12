import { Types } from 'mongoose';
import { IProduct } from '../models/product.model.js';
import { CartItemModel, CartItemDTO, InvalidationReason } from '../types/cart.types.js';

export class CartItemMapper {
  /**
   * Transforms raw item details to a formatted CartItemDTO.
   */
  static toDTO(
    item: CartItemModel,
    product: IProduct | null,
    category: { name: string; slug: string } | null,
    stockAvailable: number
  ): CartItemDTO {
    const defaultDTO = (reason: InvalidationReason): CartItemDTO => ({
      productId: item.productId.toString(),
      name: product?.name ?? 'Unknown Product',
      slug: product?.slug ?? '',
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      currentPrice: product?.price ?? 0,
      priceDiff: (product?.price ?? 0) - item.priceSnapshot,
      primaryImage: null,
      category: null,
      availability: {
        status: 'OUT_OF_STOCK',
        label: 'Out of Stock',
        maxAvailable: 0,
      },
      isValid: false,
      validationReason: reason,
      addedAt: item.addedAt,
    });

    // 1. Validate existence and published visibility state
    if (!product) {
      return defaultDTO('ARCHIVED');
    }
    if (product.visibility !== 'published') {
      return defaultDTO('UNPUBLISHED');
    }

    // 2. Resolve stock availability label
    const maxAvailable = Math.max(0, stockAvailable);
    let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    if (maxAvailable === 0) {
      status = 'OUT_OF_STOCK';
    } else if (maxAvailable <= 5) {
      status = 'LOW_STOCK';
    }

    const labels = {
      IN_STOCK: 'In Stock',
      LOW_STOCK: 'Low Stock',
      OUT_OF_STOCK: 'Out of Stock',
    };

    const isOutOfStock = maxAvailable === 0;
    const isExceedingStock = item.quantity > maxAvailable;

    let isValid = true;
    let validationReason: InvalidationReason | undefined;

    if (isOutOfStock) {
      isValid = false;
      validationReason = 'OUT_OF_STOCK';
    } else if (isExceedingStock) {
      isValid = false;
      validationReason = 'OUT_OF_STOCK'; // Quantity exceeds current stock bounds
    }

    const primaryImage = (product.images ?? []).find((img) => img.isPrimary) ?? null;

    return {
      productId: (product._id as Types.ObjectId).toString(),
      name: product.name,
      slug: product.slug,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      currentPrice: product.price,
      priceDiff: product.price - item.priceSnapshot,
      primaryImage: primaryImage
        ? {
            url: primaryImage.url,
            alt: primaryImage.alt,
            width: primaryImage.width,
            height: primaryImage.height,
          }
        : null,
      category: category
        ? {
            name: category.name,
            categorySlug: category.slug,
          }
        : null,
      availability: {
        status,
        label: labels[status],
        maxAvailable,
      },
      isValid,
      validationReason,
      addedAt: item.addedAt,
    };
  }
}
