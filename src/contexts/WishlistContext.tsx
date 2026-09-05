"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { Product, mapWishlistCardToUI } from '@/types/Product';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlist.service';
import { ApiClientError } from '@/lib/api-client';
import { useRouter, usePathname } from 'next/navigation';
import { WishlistResponse } from '@/types/wishlist.types';
import { useAuth } from './AuthContext';

type WishlistContextType = {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean; // Legacy synchronous check, relies on main wishlist cache
  isLoading: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Hook for isolated pages to check membership without fetching the whole wishlist
export const useWishlistCheck = (productId: string) => {
  const queryClient = useQueryClient();
  
  // Try to derive from full wishlist cache first
  const fullWishlist = queryClient.getQueryData<WishlistResponse>(['wishlist', { page: 1 }]);
  const derivedStatus = fullWishlist?.products?.some(p => p.productId === productId);

  const { data: isWishlisted } = useQuery({
    queryKey: ['wishlist', 'check', productId],
    queryFn: () => wishlistService.checkWishlistStatus(productId),
    enabled: derivedStatus === undefined, // Only fetch if we couldn't derive it
    initialData: derivedStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  return isWishlisted ?? false;
};

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus } = useAuth();

  // Cleanup legacy localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('wishlist')) {
      localStorage.removeItem('wishlist');
      console.log('Cleaned up legacy localStorage wishlist');
    }
  }, []);

  const handleError = (error: unknown, fallbackMessage: string) => {
    if (error instanceof ApiClientError) {
      if (error.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue",
          variant: "destructive",
        });
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
        return;
      }
      toast({
        title: "Wishlist Error",
        description: error.message || fallbackMessage,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Error",
      description: fallbackMessage,
      variant: "destructive",
    });
  };

  const { data: wishlistDTO, isLoading } = useQuery({
    queryKey: ['wishlist', { page: 1 }],
    queryFn: () => wishlistService.getWishlist(1, 50),
    retry: false, // Don't retry on 401s
    enabled: authStatus === 'authenticated',
  });

  const items: Product[] = (wishlistDTO?.products || []).map(mapWishlistCardToUI);

  const addMutation = useMutation({
    mutationFn: (productId: string) => wishlistService.addToWishlist(productId),
    onMutate: async (productId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previousWishlist = queryClient.getQueryData<WishlistResponse>(['wishlist', { page: 1 }]);
      
      // We don't have the full Product info to optimistically add to the array perfectly,
      // but we MUST update the 'check' cache so heart icons flip instantly.
      queryClient.setQueryData(['wishlist', 'check', productId], true);
      
      return { previousWishlist };
    },
    onSuccess: (data, productId) => {
      queryClient.setQueryData(['wishlist', { page: 1 }], data);
      queryClient.setQueryData(['wishlist', 'check', productId], true);
      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist",
        duration: 3000,
      });
    },
    onError: (err, productId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist', { page: 1 }], context.previousWishlist);
      }
      queryClient.setQueryData(['wishlist', 'check', productId], false);
      handleError(err, "Failed to add to wishlist");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistService.removeFromWishlist(productId),
    onMutate: async (productId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previousWishlist = queryClient.getQueryData<WishlistResponse>(['wishlist', { page: 1 }]);
      
      if (previousWishlist) {
        queryClient.setQueryData<WishlistResponse>(['wishlist', { page: 1 }], {
          ...previousWishlist,
          products: previousWishlist.products.filter(p => p.productId !== productId)
        });
      }
      queryClient.setQueryData(['wishlist', 'check', productId], false);
      
      return { previousWishlist };
    },
    onSuccess: (data, productId) => {
      queryClient.setQueryData(['wishlist', { page: 1 }], data);
      queryClient.setQueryData(['wishlist', 'check', productId], false);
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
        duration: 3000,
      });
    },
    onError: (err, productId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist', { page: 1 }], context.previousWishlist);
      }
      queryClient.setQueryData(['wishlist', 'check', productId], true);
      handleError(err, "Failed to remove from wishlist");
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => wishlistService.clearWishlist(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: "Wishlist cleared",
        description: "All items have been removed from your wishlist",
        duration: 3000,
      });
    },
    onError: (error) => handleError(error, "Failed to clear wishlist"),
  });

  const addItem = (product: Product) => addMutation.mutate(String(product.id));
  const removeItem = (productId: string) => removeMutation.mutate(productId);
  const toggleItem = (product: Product) => {
    const productId = String(product.id);
    // Check if it's in the full list OR check cache
    const inFullList = items.some(p => String(p.id) === productId);
    const checkCache = queryClient.getQueryData<boolean>(['wishlist', 'check', productId]);
    
    if (inFullList || checkCache) {
      removeItem(productId);
    } else {
      addItem(product);
    }
  };

  const clearWishlist = () => clearMutation.mutate();

  // Legacy synchronous check: only reliable if the full list is fetched.
  // Use `useWishlistCheck` in components whenever possible!
  const isInWishlist = (productId: string) => items.some(item => String(item.id) === productId);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        clearWishlist,
        isInWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
