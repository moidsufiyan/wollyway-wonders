
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { type Product } from '@/pages/Shop';

type ProductGridProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const ProductGrid = ({ products, onAddToCart }: ProductGridProps) => {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {products.map(product => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </motion.div>
  );
};

const ProductCard = ({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) => {
  return (
    <motion.div variants={item} className="group rounded-xl overflow-hidden border border-border bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Quick Action Buttons */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white text-wolly-magenta hover:bg-white/90"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Heart size={16} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white text-wolly-magenta hover:bg-white/90"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(product);
              }}
            >
              <ShoppingCart size={16} />
            </Button>
            <Link to={`/product/${product.id}`}>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-white text-wolly-magenta hover:bg-white/90"
              >
                <Eye size={16} />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* New or Featured badge */}
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-wolly-magenta text-white text-xs font-semibold px-2 py-1 rounded-full">
            NEW
          </span>
        )}
        {product.isFeatured && !product.isNew && (
          <span className="absolute top-3 left-3 bg-wolly-pink text-white text-xs font-semibold px-2 py-1 rounded-full">
            FEATURED
          </span>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-1">
          <span className="text-xs text-muted-foreground">{product.category}</span>
          <div className="ml-auto flex items-center gap-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
        </div>
        
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-medium text-foreground hover:text-wolly-magenta transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-wolly-magenta">${product.price.toFixed(2)}</span>
          
          {/* Stock indicator */}
          {product.stockCount && product.stockCount < 10 && (
            <span className="text-xs text-orange-600">
              Only {product.stockCount} left
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductGrid;
