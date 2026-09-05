"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { Product, mapCartItemToUI } from '@/types/Product';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { ApiClientError } from '@/lib/api-client';
import { useRouter, usePathname } from 'next/navigation';
import { CartDTO } from '@/types/cart.types';
import { useAuth } from './AuthContext';

type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  taxTotal: number;
  orderTotal: number;
  hasInvalidItems: boolean;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus } = useAuth();

  // Cleanup legacy localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('cart')) {
      localStorage.removeItem('cart');
      console.log('Cleaned up legacy localStorage cart');
    }
  }, []);

  // Central error handler for auth redirects and toasts
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
        title: "Cart Error",
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

  const { data: cartDTO, isLoading, error: queryError } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    retry: false, // Don't aggressively retry on 401s, let it fail fast
    enabled: authStatus === 'authenticated',
  });

  // If query returns 401, cart is simply unauthenticated. 
  // We leave items as empty, but we do NOT assume it's a 0-item cart if auth failed.
  // The UI will see `items: []` but we have `isLoading` to distinguish.
  const isUnauthenticated = queryError instanceof ApiClientError && queryError.status === 401;

  const items: CartItem[] = (cartDTO?.items || []).map(dto => ({
    product: mapCartItemToUI(dto),
    quantity: dto.quantity,
  }));

  const itemCount = cartDTO?.totals?.itemCount || 0;
  const subtotal = cartDTO?.totals?.subtotal || 0;
  const shippingFee = cartDTO?.totals?.shippingFee || 0;
  const taxTotal = cartDTO?.totals?.taxTotal || 0;
  const orderTotal = cartDTO?.totals?.orderTotal || 0;
  const hasInvalidItems = cartDTO?.totals?.hasInvalidItems || false;

  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => 
      cartService.addItem(productId, quantity),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
        duration: 3000,
      });
    },
    onError: (error) => handleError(error, "Failed to add item to cart"),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => cartService.removeItem(productId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
        duration: 3000,
      });
    },
    onError: (error) => handleError(error, "Failed to remove item"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => 
      cartService.updateQuantity(productId, quantity),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
    },
    onError: (error) => handleError(error, "Failed to update quantity"),
  });

  const clearMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
        duration: 3000,
      });
    },
    onError: (error) => handleError(error, "Failed to clear cart"),
  });

  const addItem = (product: Product, quantity = 1) => {
    addMutation.mutate({ productId: product.id, quantity });
  };

  const removeItem = (productId: string) => {
    removeMutation.mutate(productId);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    updateMutation.mutate({ productId, quantity });
  };

  const clearCart = () => {
    clearMutation.mutate();
  };

  return (
    <CartContext.Provider
      value={{
        items: isUnauthenticated ? [] : items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount: isUnauthenticated ? 0 : itemCount,
        subtotal: isUnauthenticated ? 0 : subtotal,
        shippingFee: isUnauthenticated ? 0 : shippingFee,
        taxTotal: isUnauthenticated ? 0 : taxTotal,
        orderTotal: isUnauthenticated ? 0 : orderTotal,
        hasInvalidItems: isUnauthenticated ? false : hasInvalidItems,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
