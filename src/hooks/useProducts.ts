
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/api';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export type ProductFilters = {
  search?: string;
  category?: string | string[];
  priceRange?: [number, number];
  colors?: string[];
  ratingRange?: [number, number];
  inStock?: boolean;
  sortBy?: string;
};

export const parseQueryFilters = (search: string): ProductFilters => {
  const params = new URLSearchParams(search);
  
  const filters: ProductFilters = {};
  
  // Handle search term
  const searchTerm = params.get('search') || params.get('keyword');
  if (searchTerm) filters.search = searchTerm;
  
  // Handle category - could be single or multiple
  const category = params.get('category');
  if (category) {
    filters.category = category.includes(',') 
      ? category.split(',') 
      : category;
  }
  
  // Handle price range
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');
  if (minPrice !== null && maxPrice !== null) {
    filters.priceRange = [Number(minPrice), Number(maxPrice)];
  }
  
  // Handle colors
  const colors = params.get('colors');
  if (colors) filters.colors = colors.split(',');
  
  // Handle rating range
  const minRating = params.get('minRating');
  const maxRating = params.get('maxRating');
  if (minRating !== null && maxRating !== null) {
    filters.ratingRange = [Number(minRating), Number(maxRating)];
  }
  
  // Handle in stock flag
  const inStock = params.get('inStock');
  if (inStock !== null) {
    filters.inStock = inStock === 'true';
  }
  
  // Handle sort option
  const sortBy = params.get('sortBy');
  if (sortBy) filters.sortBy = sortBy;
  
  return filters;
};

export const useProducts = (initialFilters: ProductFilters = {}) => {
  const location = useLocation();
  const [filters, setFilters] = useState<ProductFilters>({
    ...initialFilters,
    ...parseQueryFilters(location.search)
  });
  
  // Update filters when URL changes
  useEffect(() => {
    const queryFilters = parseQueryFilters(location.search);
    setFilters(prev => ({
      ...prev,
      ...queryFilters
    }));
  }, [location.search]);
  
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
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
