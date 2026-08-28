"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { mapProductCardToUI } from '@/types/Product';

export const useProductSearch = (initialKeyword: string = '') => {
  const [keyword, setKeyword] = useState(initialKeyword);

  // We hit the real backend discovery API using the 'q' parameter.
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', 'search', keyword],
    queryFn: () => productService.discoverProducts({ q: keyword, limit: 12, page: 1, availability: 'all', sort: 'relevance' }),
    enabled: keyword.trim().length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  // Map backend DTOs to frontend UI view models
  const searchResults = (data?.products || []).map(mapProductCardToUI);

  return {
    keyword,
    setKeyword,
    searchResults,
    isSearching: isFetching,
    isLoading,
  };
};
