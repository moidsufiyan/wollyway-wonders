import { Types } from 'mongoose';
import { IProduct } from '../models/product.model.js';
import { WishlistCardDTO, AvailabilityInfo, AvailabilityStatus } from '../types/wishlist.types.js';

export class WishlistMapper {
  /**
   * Transforms raw database details to a lightweight WishlistCardDTO.
   */
  static toCardDTO(
    product: IProduct,
    category: { name: string; slug: string } | null,
    inStock: boolean,
    addedAt: Date
  ): WishlistCardDTO {
    const primaryImage = (product.images ?? []).find((img) => img.isPrimary) ?? null;

    const status: AvailabilityStatus = inStock ? 'IN_STOCK' : 'OUT_OF_STOCK';
    const availability: AvailabilityInfo = {
      status,
      label: status === 'IN_STOCK' ? 'In Stock' : 'Out of Stock',
    };

    return {
      productId: (product._id as Types.ObjectId).toString(),
      name: product.name,
      slug: product.slug,
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
      category: category
        ? {
            name: category.name,
            categorySlug: category.slug,
          }
        : null,
      availability,
      addedAt,
    };
  }
}
