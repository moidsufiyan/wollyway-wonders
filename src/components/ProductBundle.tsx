
import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/pages/Shop';

export type BundleProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  tags: string[];
  rating: number;
  isNew?: boolean;
  isFeatured?: boolean;
  colors?: string[];
  stockCount?: number;
};

export type Bundle = {
  id: string;
  name: string;
  description: string;
  products: BundleProduct[];
  discountPercentage: number;
  featured?: boolean;
};

interface ProductBundleProps {
  bundle: Bundle;
}

const ProductBundle: React.FC<ProductBundleProps> = ({ bundle }) => {
  const { addItem } = useCart();
  
  // Calculate original total price
  const originalTotal = bundle.products.reduce((sum, product) => sum + product.price, 0);
  
  // Calculate discounted price
  const discountedTotal = originalTotal * (1 - bundle.discountPercentage / 100);
  
  // Calculate savings
  const savings = originalTotal - discountedTotal;
  
  const handleAddBundleToCart = () => {
    // Add each product in the bundle to the cart
    bundle.products.forEach(product => {
      addItem(product, 1);
    });
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border border-border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      {bundle.featured && (
        <div className="bg-wolly-magenta text-white text-xs font-medium px-3 py-1">
          FEATURED BUNDLE
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-center mb-4">
          <Package className="text-wolly-magenta mr-2" size={20} />
          <h3 className="text-lg font-bold">{bundle.name}</h3>
        </div>
        
        <p className="text-muted-foreground mb-4">
          {bundle.description}
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
          {bundle.products.map((product, index) => (
            <React.Fragment key={product.id}>
              {index > 0 && (
                <div className="hidden sm:flex items-center justify-center">
                  <ArrowRight size={16} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 flex items-center">
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <Link to={`/product/${product.id}`} className="font-medium hover:text-wolly-magenta text-sm">
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {product.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">${product.price.toFixed(2)}</p>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
        
        <div className="border-t border-border pt-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">Original Price:</span>
            <span className="line-through">${originalTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">Bundle Discount:</span>
            <span className="text-green-600">-${savings.toFixed(2)} ({bundle.discountPercentage}%)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold">Bundle Price:</span>
            <span className="text-wolly-magenta font-bold text-xl">${discountedTotal.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            className="flex-1 bg-wolly-magenta hover:bg-wolly-magenta/90"
            onClick={handleAddBundleToCart}
          >
            <ShoppingCart size={16} className="mr-2" />
            Add Bundle to Cart
          </Button>
          <Button
            variant="outline"
            asChild
          >
            <Link to={`/bundle/${bundle.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductBundle;
