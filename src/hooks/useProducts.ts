
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/api';

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
  });
};

export const useProductDetails = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ['topProducts'],
    queryFn: () => productService.getTopProducts(),
  });
};
