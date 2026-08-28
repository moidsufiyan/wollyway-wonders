import { apiClient } from '@/lib/api-client';
import { DiscoveryQueryParams, DiscoveryResult, ProductDetailDTO } from '@/types/discovery.types';

export class ProductService {
  /**
   * Discovers products using the real backend search/filter/sort API.
   * Maps UI params to backend query params.
   */
  async discoverProducts(params: DiscoveryQueryParams): Promise<DiscoveryResult> {
    const searchParams = new URLSearchParams();

    if (params.q) searchParams.set('q', params.q);
    if (params.categorySlug) searchParams.set('categorySlug', params.categorySlug);
    if (params.minPrice !== undefined) searchParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) searchParams.set('maxPrice', params.maxPrice.toString());
    
    if (params.tags && params.tags.length > 0) {
      searchParams.set('tags', params.tags.join(','));
    }
    if (params.materials && params.materials.length > 0) {
      searchParams.set('materials', params.materials.join(','));
    }
    if (params.availability) searchParams.set('availability', params.availability);
    if (params.featured !== undefined) searchParams.set('featured', params.featured.toString());
    
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<DiscoveryResult>(endpoint);
    return response;
  }

  /**
   * Fetches a single product by slug.
   */
  async getProductBySlug(slug: string): Promise<ProductDetailDTO> {
    const response = await apiClient.get<{ success: boolean; data: ProductDetailDTO }>(`/products/${slug}`);
    return response.data;
  }

  /**
   * Fetches featured products.
   */
  async getFeaturedProducts(): Promise<ProductDetailDTO[]> {
    const response = await apiClient.get<{ success: boolean; data: ProductDetailDTO[] }>('/products/featured');
    return response.data;
  }

  /**
   * Fetches categories.
   */
  async getCategories(featuredOnly?: boolean): Promise<any[]> {
    const endpoint = featuredOnly ? '/categories?featured=true' : '/categories';
    const response = await apiClient.get<{ success: boolean; data: any[] }>(endpoint);
    return response.data;
  }
}

export const productService = new ProductService();
