"use client";

import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { useSearchParams } from 'next/navigation';
import { DiscoveryQueryParams, SortOption, AvailabilityFilter } from '@/types/discovery.types';

export const parseQueryFilters = (searchParams: URLSearchParams): DiscoveryQueryParams => {
  const params: DiscoveryQueryParams = {};
  
  // Search
  const q = searchParams.get('q') || searchParams.get('keyword') || searchParams.get('search');
  if (q) params.q = q;
  
  // Category
  const categorySlug = searchParams.get('category'); // the URL uses 'category', we map to 'categorySlug'
  if (categorySlug) {
    // If it's a comma separated list in the legacy URL, take the first one (since backend expects a single string slug)
    params.categorySlug = categorySlug.split(',')[0];
  }
  
  // Price
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice !== null) params.minPrice = Number(minPrice);
  if (maxPrice !== null) params.maxPrice = Number(maxPrice);
  
  // Availability
  const inStock = searchParams.get('inStock');
  if (inStock === 'true') {
    params.availability = 'in_stock';
  } else {
    // Default or explicitly all
    params.availability = 'all'; 
  }
  
  // Sort
  const sortBy = searchParams.get('sortBy');
  if (sortBy) {
    // Map legacy frontend sorts to backend SortOptions if needed, 
    // assuming they match or doing simple conversion here.
    // 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'featured'
    const sortMap: Record<string, SortOption> = {
      'newest': 'newest',
      'price-low': 'price_asc',
      'price-high': 'price_desc',
      'rating': 'relevance', // We don't have rating sort on backend, fallback to relevance/featured
      'bestsellers': 'featured',
      'trending': 'featured'
    };
    params.sort = sortMap[sortBy] || (sortBy as SortOption);
  } else {
    params.sort = 'newest';
  }

  // Pagination
  const page = searchParams.get('page');
  if (page) params.page = Number(page);
  else params.page = 1;

  const limit = searchParams.get('limit');
  if (limit) params.limit = Number(limit);
  else params.limit = 12;
  
  return params;
};

export const useProducts = () => {
  const searchParams = useSearchParams();
  
  // Derive completely from URL - no useState to drift
  const queryParams = searchParams ? parseQueryFilters(searchParams) : { page: 1, limit: 12, availability: 'all' as AvailabilityFilter, sort: 'newest' as SortOption };
  
  return useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productService.discoverProducts(queryParams),
  });
};

export const useProductDetails = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug),
    enabled: !!slug,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productService.getFeaturedProducts(),
  });
};

// Also adding a hook for categories
export const useCategories = (featuredOnly?: boolean) => {
  return useQuery({
    queryKey: ['categories', { featured: featuredOnly }],
    queryFn: () => productService.getCategories(featuredOnly),
  });
};
