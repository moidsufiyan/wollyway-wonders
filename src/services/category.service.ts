import { apiClient } from '@/lib/api-client';
import {
  CategoryDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryFilterParams,
} from '@/types/category.types';

export class CategoryService {
  async getCategories(params?: CategoryFilterParams): Promise<CategoryDTO[]> {
    const queryParams = new URLSearchParams();
    if (params?.featured !== undefined) {
      queryParams.append('featured', String(params.featured));
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    const queryString = queryParams.toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<{
      success: boolean;
      count: number;
      data: CategoryDTO[];
    }>(endpoint);

    return response.data;
  }

  async getCategoryBySlug(slug: string): Promise<CategoryDTO> {
    const response = await apiClient.get<{
      success: boolean;
      data: CategoryDTO;
    }>(`/categories/${slug}`);

    return response.data;
  }

  async createCategory(data: CreateCategoryDTO): Promise<CategoryDTO> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: CategoryDTO;
    }>('/categories', data);

    return response.data;
  }

  async updateCategory(id: string, data: UpdateCategoryDTO): Promise<CategoryDTO> {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: CategoryDTO;
    }>(`/categories/${id}`, data);

    return response.data;
  }

  async archiveCategory(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/categories/${id}`);

    return response;
  }
}

export const categoryService = new CategoryService();
