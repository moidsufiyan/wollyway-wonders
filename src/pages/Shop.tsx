
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductFilters from '@/components/ProductFilters';
import ProductGrid from '@/components/ProductGrid';
import { useProducts, parseQueryFilters } from '@/hooks/useProducts';

import SearchPage from '@/components/SearchPage';
import { Button } from '@/components/ui/button';
import { Filter, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';

import { type Product } from '@/types/Product';

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const isSearchMode = searchParams.has('search') || searchParams.has('keyword');
  
  const [showFilters, setShowFilters] = useState(false);

  const [savedCart, setSavedCart] = useState<Product[]>([]);
  
  // Get filters from URL
  const queryFilters = parseQueryFilters(location.search);
  const activeCategory = queryFilters.category as string | undefined;
  
  // Define default filter values
  const defaultFilters = {
    categories: Array.isArray(queryFilters.category) 
      ? queryFilters.category 
      : queryFilters.category ? [queryFilters.category] : [],
    priceRange: queryFilters.priceRange || [0, 100] as [number, number],
    colors: queryFilters.colors || [] as string[],
    ratingRange: queryFilters.ratingRange || [1, 5] as [number, number],
    inStock: queryFilters.inStock || false,
    sortBy: queryFilters.sortBy || 'newest'
  };
  
  const [filters, setFilters] = useState(defaultFilters);
  
  // Use enhanced products hook
  const { data: products, isLoading } = useProducts(queryFilters);

  const { addItem } = useCart();
  const { toast } = useToast();
  

  
  // Handle URL updates when filters change
  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    
    // Preserve search term if it exists
    const searchTerm = currentParams.get('search') || currentParams.get('keyword');
    
    const newParams = new URLSearchParams();
    
    // Add search term if it exists
    if (searchTerm) {
      newParams.set('search', searchTerm);
    }
    
    // Add categories
    if (filters.categories.length > 0) {
      newParams.set('category', filters.categories.join(','));
    }
    
    // Add price range if not default
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 100) {
      newParams.set('minPrice', filters.priceRange[0].toString());
      newParams.set('maxPrice', filters.priceRange[1].toString());
    }
    
    // Add colors
    if (filters.colors.length > 0) {
      newParams.set('colors', filters.colors.join(','));
    }
    
    // Add rating range if not default
    if (filters.ratingRange[0] !== 1 || filters.ratingRange[1] !== 5) {
      newParams.set('minRating', filters.ratingRange[0].toString());
      newParams.set('maxRating', filters.ratingRange[1].toString());
    }
    
    // Add in stock flag if true
    if (filters.inStock) {
      newParams.set('inStock', 'true');
    }
    
    // Add sort option if not default
    if (filters.sortBy !== 'newest') {
      newParams.set('sortBy', filters.sortBy);
    }
    
    // Update URL if params have changed
    const newSearch = newParams.toString();
    if (newSearch !== location.search.replace(/^\?/, '')) {
      navigate(`/shop${newSearch ? `?${newSearch}` : ''}`, { replace: true });
    }
  }, [filters, navigate]);
  

  
  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };
  
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };
  
  // Save an item for later
  const saveForLater = (product: Product) => {
    setSavedCart(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (!exists) {
        toast({
          title: "Saved for later",
          description: `${product.name} has been saved for later.`,
          duration: 3000,
        });
        return [...prev, product];
      }
      return prev;
    });
  };
  
  // Move saved item to cart
  const moveToCart = (product: Product) => {
    addItem(product, 1);
    setSavedCart(prev => prev.filter(item => item.id !== product.id));
    toast({
      title: "Moved to cart",
      description: `${product.name} has been moved to your cart.`,
      duration: 3000,
    });
  };
  
  // Reset filters and get back to default state
  const resetFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 100],
      colors: [],
      ratingRange: [1, 5],
      inStock: false,
      sortBy: 'newest'
    });
  };
  
  // Handle filter changes coming from the ProductFilters component
  const handleFilterChange = (newFilters: Partial<{
    categories: string[];
    priceRange: [number, number];
    colors: string[];
    ratingRange: [number, number];
    inStock: boolean;
    sortBy: string;
  }>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  // Apply filters to products
  const filteredProducts = products?.products?.filter(product => {
    const matchesCategory = 
      filters.categories.length === 0 || 
      filters.categories.includes(product.category);
    const matchesPrice = 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1];
    const matchesColor = 
      filters.colors.length === 0 || 
      product.colors.some(color => filters.colors.includes(color));
    const matchesRating =
      product.rating >= filters.ratingRange[0] &&
      product.rating <= filters.ratingRange[1];
    const matchesStock =
      !filters.inStock || (product.countInStock && product.countInStock > 0);
    
    return matchesCategory && matchesPrice && matchesColor && matchesRating && matchesStock;
  }) || [];
  
  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'bestsellers':
        return (b.numReviews || 0) - (a.numReviews || 0);
      case 'trending':
        return ((b.numReviews || 0) * b.rating) - ((a.numReviews || 0) * a.rating);
      default: // newest
        return Number(b.id) - Number(a.id);
    }
  });
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    // Load saved cart from localStorage
    const savedCartItems = localStorage.getItem('savedCart');
    if (savedCartItems) {
      try {
        setSavedCart(JSON.parse(savedCartItems));
      } catch (e) {
        console.error('Error parsing saved cart data', e);
      }
    }
  }, []);
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('savedCart', JSON.stringify(savedCart));
  }, [savedCart]);
  
  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* If search param is present, show search page instead */}
          {isSearchMode ? (
            <SearchPage />
          ) : (
            <>
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Shop Our Collection</h1>
                  <p className="text-muted-foreground dark:text-gray-400">
                    Browse our handcrafted products made with love
                  </p>
                </div>

              </div>
              
              {/* Category Breadcrumb for filtered views */}
              {activeCategory && (
                <div className="mb-6">
                  <ProductBreadcrumb categoryPath={activeCategory} product={{} as Product} />
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-8">
                {/* Filters - show on larger screens or when toggled */}
                <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
                  <ProductFilters 
                    filters={filters}
                    onFilterChange={handleFilterChange}
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
                      <span className="text-sm text-muted-foreground dark:text-gray-400 mr-3 hidden md:inline">
                        {sortedProducts.length} Products
                      </span>
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
                          <p className="text-muted-foreground dark:text-gray-400 mb-6">
                            Try adjusting your filters to find what you're looking for
                          </p>
                          <Button onClick={resetFilters}>Clear All Filters</Button>
                        </div>
                      ) : (
                        <ProductGrid 
                          products={sortedProducts} 
                          onAddToCart={handleAddToCart} 
                          onSaveForLater={saveForLater}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Recently Viewed Products */}

          
          {/* Saved for Later Products */}
          {savedCart.length > 0 && !isSearchMode && (
            <div className="mt-16">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">Saved For Later</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {savedCart.map(product => (
                    <div key={product.id} className="bg-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                      <img 
                        src={product.image}
                        alt={product.name}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                        <p className="text-wolly-magenta font-bold">${product.price.toFixed(2)}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 text-xs"
                          onClick={() => moveToCart(product)}
                        >
                          <ShoppingBag size={14} className="mr-1" /> Move to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Shop;
