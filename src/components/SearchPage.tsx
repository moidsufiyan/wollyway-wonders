
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProductSearch } from '@/hooks/useProductSearch';
import ProductGrid from '@/components/ProductGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { type Product } from '@/types/Product';
import { useToast } from '@/hooks/use-toast';
import ProductBreadcrumb from './product/ProductBreadcrumb';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('search') || searchParams.get('keyword') || '';
  
  const { 
    keyword, 
    setKeyword, 
    searchResults, 
    isSearching,
    isLoading 
  } = useProductSearch(initialQuery);
  
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shop?search=${encodeURIComponent(keyword.trim())}`);
    }
  };

  useEffect(() => {
    // Update search term if URL parameter changes
    const searchParam = searchParams.get('search') || searchParams.get('keyword');
    if (searchParam && searchParam !== keyword) {
      setKeyword(searchParam);
    }
  }, [location.search, searchParams, setKeyword, keyword]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-wolly-magenta hover:bg-wolly-magenta/90">
              <Search size={18} className="mr-2" />
              Search
            </Button>
          </form>
        </div>

        {keyword && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {searchResults.length > 0 ? (
              <>
                <div className="mb-6">
                  <ProductBreadcrumb 
                    product={{} as Product} 
                    categoryPath={`Search results: "${keyword}"`} 
                  />
                  <h2 className="text-2xl font-bold">
                    Search Results for "{keyword}"
                  </h2>
                  <p className="text-muted-foreground">
                    Found {searchResults.length} products matching your search
                  </p>
                </div>
                <ProductGrid products={searchResults} onAddToCart={handleAddToCart} />
              </>
            ) : (
              <div className="text-center py-12">
                {isSearching || isLoading ? (
                  <div className="animate-pulse">Searching...</div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-4">No results found</h2>
                    <p className="text-muted-foreground mb-6">
                      We couldn't find any products matching "{keyword}"
                    </p>
                    <Button 
                      onClick={() => navigate('/shop')}
                      variant="outline"
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      Back to Shop
                    </Button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
