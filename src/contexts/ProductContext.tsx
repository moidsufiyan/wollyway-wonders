import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Product } from '@/types/Product';

type ProductContextType = {
  recentlyViewed: Product[];
  comparisonList: Product[];
  addToRecentlyViewed: (product: Product) => void;
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: number) => void;
  clearComparison: () => void;
  isInComparison: (productId: number) => boolean;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [comparisonList, setComparisonList] = useState<Product[]>([]);

  // Load from localStorage on initial render
  useEffect(() => {
    try {
      const storedRecentlyViewed = localStorage.getItem('recentlyViewed');
      if (storedRecentlyViewed) {
        setRecentlyViewed(JSON.parse(storedRecentlyViewed));
      }
      
      const storedComparison = localStorage.getItem('comparisonList');
      if (storedComparison) {
        setComparisonList(JSON.parse(storedComparison));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    } catch (error) {
      console.error('Error saving recently viewed to localStorage:', error);
    }
  }, [recentlyViewed]);

  useEffect(() => {
    try {
      localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
    } catch (error) {
      console.error('Error saving comparison list to localStorage:', error);
    }
  }, [comparisonList]);

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      // Remove the product if it already exists in the list
      const filtered = prev.filter(item => item.id !== product.id);
      
      // Add the product to the beginning of the list
      const updated = [product, ...filtered];
      
      // Keep only the last 6 items
      return updated.slice(0, 6);
    });
  };

  const addToComparison = (product: Product) => {
    if (comparisonList.length >= 4) {
      alert('You can compare up to 4 products at a time.');
      return;
    }
    
    if (!comparisonList.some(item => item.id === product.id)) {
      setComparisonList(prev => [...prev, product]);
    }
  };

  const removeFromComparison = (productId: number) => {
    setComparisonList(prev => prev.filter(item => item.id !== productId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const isInComparison = (productId: number) => {
    return comparisonList.some(item => item.id === productId);
  };

  return (
    <ProductContext.Provider
      value={{
        recentlyViewed,
        comparisonList,
        addToRecentlyViewed,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
