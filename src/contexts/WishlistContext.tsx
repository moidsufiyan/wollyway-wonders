
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/Product';
import { useToast } from '@/hooks/use-toast';

type WishlistContextType = {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);
  const { toast } = useToast();

  // Load wishlist from localStorage on initial render
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Error parsing wishlist data from localStorage', e);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    if (!isInWishlist(product.id)) {
      setItems(prevItems => [...prevItems, product]);
      
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist`,
        duration: 3000,
      });
    }
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
    
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
      duration: 3000,
    });
  };

  const toggleItem = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  const clearWishlist = () => {
    setItems([]);
    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist",
      duration: 3000,
    });
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
