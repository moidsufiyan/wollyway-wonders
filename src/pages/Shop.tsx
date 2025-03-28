
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductFilters from '@/components/ProductFilters';
import ProductGrid from '@/components/ProductGrid';
import ProductSort from '@/components/ProductSort';
import { useProducts } from '@/hooks/useProducts';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import RecentlyViewed from '@/components/RecentlyViewed';
import SearchPage from '@/components/SearchPage';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

// Define the product type for better type checking
export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  colors: string[];
  tags: string[];
  category: string;
  rating: number;
  description?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  stockCount?: number;
  stock?: number;
  discount?: number;
  reviews?: number;
  sizes?: string[];
};

const Shop = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isSearchMode = searchParams.has('search');
  
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [filters, setFilters] = useState({
    categories: [] as string[],
    priceRange: [0, 1000] as [number, number],
    colors: [] as string[],
  });
  
  const { data: products, isLoading } = useProducts();
  const { recentlyViewed } = useRecentlyViewed();
  const { addItem } = useCart();
  
  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };
  
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };
  
  // Reset filters and get back to default state
  const resetFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 1000],
      colors: [],
    });
    setSortOption('newest');
  };
  
  // Apply filters to products
  const filteredProducts = products ? products.filter(product => {
    const matchesCategory = 
      filters.categories.length === 0 || 
      filters.categories.includes(product.category);
    const matchesPrice = 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1];
    const matchesColor = 
      filters.colors.length === 0 || 
      product.colors.some(color => filters.colors.includes(color));
    
    return matchesCategory && matchesPrice && matchesColor;
  }) : [];
  
  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default: // newest
        return b.id - a.id;
    }
  });
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* If search param is present, show search page instead */}
          {isSearchMode ? (
            <SearchPage />
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Shop Our Collection</h1>
                <p className="text-muted-foreground">
                  Browse our handcrafted products made with love
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8">
                {/* Filters - show on larger screens or when toggled */}
                <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
                  <ProductFilters 
                    filters={filters}
                    setFilters={setFilters}
                    resetFilters={resetFilters}
                    onClose={() => setShowFilters(false)}
                  />
                </div>
                
                <div className="md:w-3/4">
                  <div className="flex justify-between items-center mb-6">
                    <Button 
                      variant="outline" 
                      className="md:hidden"
                      onClick={toggleFilters}
                    >
                      <Filter size={16} className="mr-2" />
                      {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-3 hidden md:inline">
                        {sortedProducts.length} Products
                      </span>
                      <ProductSort onSortChange={setSortOption} />
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-96">
                      <div className="animate-pulse">Loading products...</div>
                    </div>
                  ) : (
                    <>
                      {sortedProducts.length === 0 ? (
                        <div className="text-center py-12">
                          <h2 className="text-xl font-medium mb-4">No products found</h2>
                          <p className="text-muted-foreground mb-6">
                            Try adjusting your filters to find what you're looking for
                          </p>
                          <Button onClick={resetFilters}>Clear All Filters</Button>
                        </div>
                      ) : (
                        <ProductGrid products={sortedProducts} onAddToCart={handleAddToCart} />
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Recently Viewed Products */}
          {recentlyViewed.length > 0 && !isSearchMode && (
            <div className="mt-16">
              <RecentlyViewed products={recentlyViewed} />
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Shop;
