import { Types } from 'mongoose';
import { ICart } from '../models/cart.model.js';
import { CartDTO, CartItemDTO } from '../types/cart.types.js';

export class CartMapper {
  private static MAX_SUBTOTAL_LIMIT = 200000; // ₹2,00,000 (stored in cents: 20000000)

  /**
   * Transforms raw database details to a complete CartDTO.
   * Derives subtotals, item counts, price changed alerts and max limits flags.
   */
  static toDTO(cart: ICart, itemDTOs: CartItemDTO[]): CartDTO {
    let subtotal = 0;
    let itemCount = 0;
    let priceChanged = false;
    let hasInvalidItems = false;

    for (const item of itemDTOs) {
      if (item.isValid) {
        subtotal += item.currentPrice * item.quantity;
        itemCount += item.quantity;
      } else {
        hasInvalidItems = true;
      }

      if (item.priceDiff !== 0) {
        priceChanged = true;
      }
    }

    const exceedsMaxSubtotal = subtotal > this.MAX_SUBTOTAL_LIMIT;

    return {
      _id: (cart._id as Types.ObjectId).toString(),
      userId: (cart.userId as Types.ObjectId).toString(),
      items: itemDTOs,
      totals: {
        subtotal,
        itemCount,
        priceChanged,
        hasInvalidItems,
        exceedsMaxSubtotal,
      },
      updatedAt: cart.updatedAt,
    };
  }
}
