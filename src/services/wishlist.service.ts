import { apiClient } from '@/lib/api-client';
import { WishlistResponse } from '@/types/wishlist.types';

export class WishlistService {
  /**
   * Retrieves the user's paginated wishlist.
   */
  async getWishlist(page = 1, limit = 50): Promise<WishlistResponse> {
    const response = await apiClient.get<WishlistResponse>(`/wishlist?page=${page}&limit=${limit}`);
    return response;
  }

  /**
   * Checks if a specific product is in the user's wishlist.
   */
  async checkWishlistStatus(productId: string): Promise<boolean> {
    const response = await apiClient.get<{ success: boolean; data: { isWishlisted: boolean } }>(`/wishlist/check/${productId}`);
    return response.data.isWishlisted;
  }

  /**
   * Adds a product to the user's wishlist.
   */
  async addToWishlist(productId: string): Promise<WishlistResponse> {
    const response = await apiClient.post<WishlistResponse>('/wishlist', { productId });
    return response;
  }

  /**
   * Removes a product from the user's wishlist.
   */
  async removeFromWishlist(productId: string): Promise<WishlistResponse> {
    const response = await apiClient.delete<WishlistResponse>(`/wishlist/${productId}`);
    return response;
  }

  /**
   * Clears the entire wishlist.
   */
  async clearWishlist(): Promise<void> {
    await apiClient.delete('/wishlist');
  }
}

export const wishlistService = new WishlistService();
