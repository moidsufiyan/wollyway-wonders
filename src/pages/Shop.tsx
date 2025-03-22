
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import ProductFilters from '@/components/ProductFilters';
import ProductSort from '@/components/ProductSort';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Product type definition
export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  rating: number;
  isNew?: boolean;
  isFeatured?: boolean;
  colors?: string[];
  description?: string;
  stockCount?: number;
};

// Sample product data
const allProducts: Product[] = [
  {
    id: 1,
    name: "Super Hero Keychain",
    price: 19.99,
    image: "/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png",
    category: "Keychains",
    tags: ["superhero", "black", "red", "white"],
    rating: 4.5,
    isNew: true,
    colors: ["black", "red", "white"],
    description: "Handcrafted superhero themed keychain made with premium materials. Comes with metal clasp.",
    stockCount: 15
  },
  {
    id: 2,
    name: "Friendship Bracelets Set",
    price: 24.99,
    image: "/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png",
    category: "Bracelets",
    tags: ["friendship", "wristband", "black", "red", "white"],
    rating: 4.8,
    isFeatured: true,
    colors: ["black", "red", "white"],
    description: "Set of handwoven friendship bands with custom designs. Perfect gift for friends.",
    stockCount: 10
  },
  {
    id: 3,
    name: "Batman Inspired Band",
    price: 22.99,
    image: "/lovable-uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png",
    category: "Bands",
    tags: ["superhero", "batman", "black", "yellow"],
    rating: 4.7,
    isNew: false,
    colors: ["black", "yellow"],
    description: "Superhero-inspired handwoven band with iconic pattern. Durable and stylish.",
    stockCount: 8
  },
  {
    id: 4,
    name: "Cosmic Wave Band",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1617006898062-3575ca439551?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Bands",
    tags: ["cosmic", "wave", "blue"],
    rating: 4.6,
    isNew: true,
    colors: ["blue", "purple"],
    description: "Unique cosmic wave pattern band with vibrant colors. Handcrafted with love.",
    stockCount: 12
  },
  {
    id: 5,
    name: "Galaxy Keychain",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1622060520458-0d30e8c18cf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Keychains",
    tags: ["galaxy", "space", "blue"],
    rating: 4.2,
    colors: ["blue", "purple"],
    description: "Galaxy themed keychain with swirling colors. Perfect for space enthusiasts.",
    stockCount: 20
  },
  {
    id: 6,
    name: "Sunset Melody Band",
    price: 22.99,
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Bands",
    tags: ["sunset", "melody", "orange"],
    rating: 4.9,
    isFeatured: true,
    colors: ["orange", "red"],
    description: "Sunset-inspired colorful band with unique patterns. Handwoven with premium materials.",
    stockCount: 7
  },
  {
    id: 7,
    name: "Nebula Accessory",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1625591338875-e2cca9de80a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Accessories",
    tags: ["nebula", "space", "purple"],
    rating: 4.4,
    isNew: true,
    colors: ["purple", "blue"],
    description: "Elegant nebula-themed accessory with intricate design. A statement piece for any outfit.",
    stockCount: 5
  },
  {
    id: 8,
    name: "Vintage Pattern Keychain",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1631972884680-132568d50ea3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Keychains",
    tags: ["vintage", "pattern", "brown"],
    rating: 4.3,
    colors: ["brown", "beige"],
    description: "Vintage-inspired keychain with classic patterns. Rustic and charming.",
    stockCount: 15
  }
];

// Filter options
type FilterState = {
  categories: string[];
  priceRange: [number, number];
  colors: string[];
};

// Sort options
type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'popularity';

const Shop = () => {
  const [products, setProducts] = useState<Product[]>(allProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 100],
    colors: []
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const { toast } = useToast();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filteredProducts = [...allProducts];
    
    // Apply category filter
    if (filters.categories.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        filters.categories.includes(product.category)
      );
    }
    
    // Apply price range filter
    filteredProducts = filteredProducts.filter(
      product => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );
    
    // Apply color filter
    if (filters.colors.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        product.colors?.some(color => filters.colors.includes(color))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filteredProducts.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);
        break;
      case 'priceAsc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
    }
    
    setProducts(filteredProducts);
  }, [filters, sortBy]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  const addToCart = (product: Product) => {
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 section-container">
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold"
          >
            Shop Our Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-muted-foreground mt-2 max-w-2xl mx-auto"
          >
            Explore our range of handcrafted knotted bands, keychains, and accessories
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters - Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>
          
          {/* Products */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <p className="text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{products.length}</span> products
                </p>
              </div>
              <ProductSort onSortChange={handleSortChange} />
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid products={products} onAddToCart={addToCart} />
            )}
            
            {/* Pagination placeholder */}
            <div className="mt-12 flex justify-center">
              <Button variant="outline" size="sm" className="mx-1">1</Button>
              <Button variant="outline" size="sm" className="mx-1">2</Button>
              <Button variant="outline" size="sm" className="mx-1">3</Button>
              <Button variant="ghost" size="sm">
                Next →
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Shop;
