import { apiClient } from '@/lib/api-client';
import { CartDTO } from '@/types/cart.types';

export class CartService {
  /**
   * Retrieves the current user's cart.
   */
  async getCart(): Promise<CartDTO> {
    return apiClient.get<CartDTO>('/cart');
  }

  /**
   * Adds an item to the cart or increments its quantity.
   */
  async addItem(productId: string, quantity: number): Promise<CartDTO> {
    return apiClient.post<CartDTO>('/cart/items', { productId, quantity });
  }

  /**
   * Updates the exact quantity of a cart item.
   */
  async updateQuantity(productId: string, quantity: number): Promise<CartDTO> {
    return apiClient.patch<CartDTO>(`/cart/items/${productId}`, { quantity });
  }

  /**
   * Removes an item from the cart entirely.
   */
  async removeItem(productId: string): Promise<CartDTO> {
    return apiClient.delete<CartDTO>(`/cart/items/${productId}`);
  }

  /**
   * Clears all items from the cart.
   */
  async clearCart(): Promise<CartDTO> {
    return apiClient.delete<CartDTO>('/cart');
  }

  /**
   * Moves an item from the wishlist directly into the cart.
   */
  async moveFromWishlist(productId: string): Promise<CartDTO> {
    return apiClient.post<CartDTO>('/cart/items/move-from-wishlist', { productId });
  }

  /**
   * Synchronizes cart prices with the live catalog.
   */
  async syncPrices(): Promise<CartDTO> {
    return apiClient.post<CartDTO>('/cart/sync-prices');
  }
}

export const cartService = new CartService();
