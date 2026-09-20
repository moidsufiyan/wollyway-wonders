import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  AdminProductListResult,
  AdminProductDetailDTO,
  AdminProductQueryParams,
  CreateProductPayload,
  UpdateProductPayload,
  AdminProductCardDTO,
} from '@/types/product.types';

/**
 * Fetches the admin product list from the dedicated admin API endpoint.
 * Returns products across all visibility states: draft, published, hidden, archived.
 */
export function useAdminProducts(params: AdminProductQueryParams = {}) {
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.q) searchParams.set('q', params.q);
      if (params.visibility && params.visibility !== 'all') {
        searchParams.set('visibility', params.visibility);
      }
      if (params.featured !== undefined) {
        searchParams.set('featured', params.featured.toString());
      }
      if (params.sort) searchParams.set('sort', params.sort);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());

      const qs = searchParams.toString();
      const endpoint = `/admin/products${qs ? `?${qs}` : ''}`;

      return apiClient.get<AdminProductListResult>(endpoint);
    },
    staleTime: 30000,
  });
}

/**
 * Fetches a single product's full detail (including all images with publicId,
 * isPrimary, displayOrder) from GET /admin/products/:id.
 */
export function useAdminProduct(id: string | null) {
  return useQuery({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const result = await apiClient.get<{ success: boolean; product: AdminProductDetailDTO }>(
        `/admin/products/${id}`
      );
      return result.product;
    },
    enabled: !!id,
    staleTime: 15000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      return apiClient.post<{ success: boolean; data: AdminProductCardDTO }>(
        '/admin/products',
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateProductPayload }) => {
      return apiClient.patch<{ success: boolean; data: AdminProductCardDTO }>(
        `/admin/products/${id}`,
        payload
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product', variables.id] });
    },
  });
}

/**
 * Uploads images to POST /admin/products/:id/images.
 * Accepts FormData (browser native).
 */
export function useUploadProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      return apiClient.post<{ success: boolean; message: string; data: AdminProductDetailDTO }>(
        `/admin/products/${id}/images`,
        formData
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

/**
 * Deletes a single image via DELETE /admin/products/:id/images/:publicId.
 */
export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, publicId }: { id: string; publicId: string }) => {
      const encodedPublicId = encodeURIComponent(publicId);
      return apiClient.delete<{ success: boolean; message: string; data: AdminProductDetailDTO }>(
        `/admin/products/${id}/images/${encodedPublicId}`
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

/**
 * Archives a product via DELETE /admin/products/:id.
 * A soft delete — sets visibility to 'archived'.
 */
export function useArchiveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete<{ success: boolean; message: string; data: AdminProductCardDTO }>(
        `/admin/products/${id}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}
