import { apiClient } from '@/lib/api-client';
import { CartDTO } from '@/types/cart.types';

export class CartService {
  /**
   * Retrieves the current user's cart.
   */
  async getCart(): Promise<CartDTO> {
    const response = await apiClient.get<{ success: boolean; data: CartDTO }>('/cart');
    return response.data;
  }

  /**
   * Adds an item to the cart or increments its quantity.
   */
  async addItem(productId: string, quantity: number): Promise<CartDTO> {
    const response = await apiClient.post<{ success: boolean; data: CartDTO }>('/cart/items', { productId, quantity });
    return response.data;
  }

  /**
   * Updates the exact quantity of a cart item.
   */
  async updateQuantity(productId: string, quantity: number): Promise<CartDTO> {
    const response = await apiClient.patch<{ success: boolean; data: CartDTO }>(`/cart/items/${productId}`, { quantity });
    return response.data;
  }

  /**
   * Removes an item from the cart entirely.
   */
  async removeItem(productId: string): Promise<CartDTO> {
    const response = await apiClient.delete<{ success: boolean; data: CartDTO }>(`/cart/items/${productId}`);
    return response.data;
  }

  /**
   * Clears all items from the cart.
   */
  async clearCart(): Promise<CartDTO> {
    const response = await apiClient.delete<{ success: boolean; data: CartDTO }>('/cart');
    return response.data;
  }

  /**
   * Moves an item from the wishlist directly into the cart.
   */
  async moveFromWishlist(productId: string): Promise<CartDTO> {
    const response = await apiClient.post<{ success: boolean; data: CartDTO }>('/cart/items/move-from-wishlist', { productId });
    return response.data;
  }

  /**
   * Synchronizes cart prices with the live catalog.
   */
  async syncPrices(): Promise<CartDTO> {
    const response = await apiClient.post<{ success: boolean; data: CartDTO }>('/cart/sync-prices');
    return response.data;
  }
}

export const cartService = new CartService();
