
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type Product } from '@/types/Product';

export const useProductComparison = (maxItems: number = 4) => {
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('comparisonList');
      if (stored) {
        const parsed = JSON.parse(stored);
        setComparisonList(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading comparison list:', error);
    }
  }, []);

  // Save to localStorage when list changes
  useEffect(() => {
    try {
      localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
    } catch (error) {
      console.error('Error saving comparison list:', error);
    }
  }, [comparisonList]);

  const addToComparison = (product: Product) => {
    if (!product) return;
    
    if (comparisonList.some(p => p.id === product.id)) {
      toast({
        title: "Already in comparison",
        description: `${product.name} is already in your comparison list.`,
        variant: "default",
      });
      return;
    }
    
    if (comparisonList.length >= maxItems) {
      toast({
        title: "Comparison list full",
        description: `You can compare up to ${maxItems} products at a time.`,
        variant: "destructive",
      });
      return;
    }
    
    setComparisonList(prev => [...prev, product]);
    toast({
      title: "Added to comparison",
      description: `${product.name} has been added to your comparison list.`,
    });
    
    if (comparisonList.length > 0) {
      setIsCompareOpen(true);
    }
  };

  const removeFromComparison = (productId: number) => {
    if (!productId) return;
    
    setComparisonList(prev => prev.filter(p => p.id !== productId));
    
    if (comparisonList.length <= 1) {
      setIsCompareOpen(false);
    }
  };

  const clearComparison = () => {
    setComparisonList([]);
    setIsCompareOpen(false);
  };

  const toggleCompareOpen = () => {
    if (comparisonList.length > 0) {
      setIsCompareOpen(prev => !prev);
    }
  };

  const isInComparison = (productId: number): boolean => {
    return comparisonList.some(p => p.id === productId);
  };

  return {
    comparisonList,
    isCompareOpen,
    addToComparison,
    removeFromComparison,
    clearComparison,
    toggleCompareOpen,
    isInComparison
  };
};
