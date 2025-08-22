
import { useState, useEffect } from 'react';
import { type Product } from '@/types/Product';

export const useRecentlyViewed = (initialLimit: number = 6) => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [limit, setLimit] = useState(initialLimit);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(Array.isArray(parsed) ? parsed.slice(0, limit) : []);
      }
    } catch (error) {
      console.error('Error loading recently viewed products:', error);
    }
  }, [limit]);

  const addProduct = (product: Product) => {
    if (!product) return;
    
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== product.id);
      
      // Add to beginning of array
      const updated = [product, ...filtered].slice(0, limit);
      
      // Save to localStorage
      try {
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recently viewed products:', error);
      }
      
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewed');
  };

  const updateLimit = (newLimit: number) => {
    setLimit(newLimit);
  };

  return {
    recentlyViewed,
    addProduct,
    clearRecentlyViewed,
    updateLimit
  };
};
