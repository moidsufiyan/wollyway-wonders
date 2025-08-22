
import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { type Product } from '@/types/Product';

export const useProductSearch = (initialKeyword: string = '') => {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { data: productData, isLoading } = useProducts();
  const products = productData?.products || [];

  useEffect(() => {
    if (!keyword.trim() || !products?.length) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const lowerKeyword = keyword.toLowerCase();
    
    // Simple search implementation - can be expanded for more sophisticated searching
    const results = products.filter(product => 
      product.name.toLowerCase().includes(lowerKeyword) || 
      product.description?.toLowerCase().includes(lowerKeyword) ||
      product.category.toLowerCase().includes(lowerKeyword) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    );
    
    setSearchResults(results);
    setIsSearching(false);
  }, [keyword, products]);

  return {
    keyword,
    setKeyword,
    searchResults,
    isSearching,
    isLoading,
  };
};
