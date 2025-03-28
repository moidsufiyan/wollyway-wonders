
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Product } from '@/pages/Shop';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductQuickView from './ProductQuickView';
import { useToast } from '@/hooks/use-toast';

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
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  
  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  return (
    <>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart} 
            onQuickView={handleQuickView}
          />
        ))}
      </motion.div>
      
      <ProductQuickView 
        product={quickViewProduct} 
        open={quickViewOpen} 
        onOpenChange={setQuickViewOpen} 
      />
    </>
  );
};

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
};

const ProductCard = ({ product, onAddToCart, onQuickView }: ProductCardProps) => {
  const { toggleItem, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };
  
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    
    toast({
      title: isInWishlist(product.id) ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isInWishlist(product.id) ? "removed from" : "added to"} your wishlist`,
    });
  };
  
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };
  
  // Determine stock status
  const getStockStatus = () => {
    if (!product.stockCount) return null; // No badge if stockCount is not defined
    if (product.stockCount <= 0) return "Out of Stock";
    if (product.stockCount < 5) return "Low Stock";
    return null; // No badge if plenty in stock
  };
  
  const stockStatus = getStockStatus();
  const stockColor = 
    stockStatus === "Low Stock" ? "bg-amber-100 text-amber-800" :
    stockStatus === "Out of Stock" ? "bg-red-100 text-red-800" : "";

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
              onClick={handleToggleWishlist}
            >
              <Heart size={16} className={isInWishlist(product.id) ? "fill-wolly-magenta" : ""} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white text-wolly-magenta hover:bg-white/90"
              onClick={handleAddToCart}
              disabled={stockStatus === "Out of Stock"}
            >
              <ShoppingCart size={16} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white text-wolly-magenta hover:bg-white/90"
              onClick={handleQuickView}
            >
              <Eye size={16} />
            </Button>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="bg-wolly-magenta text-white">NEW</Badge>
          )}
          {product.isFeatured && !product.isNew && (
            <Badge className="bg-wolly-pink text-white">FEATURED</Badge>
          )}
          {stockStatus && (
            <Badge className={stockColor}>{stockStatus}</Badge>
          )}
        </div>
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
          {product.stockCount !== undefined && product.stockCount < 10 && product.stockCount > 0 && (
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
