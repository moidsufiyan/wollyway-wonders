
import React, { useState } from 'react';
import { Heart, Star, Minus, Plus, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Product } from '@/types/Product';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import SocialShareButtons from '@/components/SocialShareButtons';
import LoyaltyPoints from '@/components/LoyaltyPoints';

interface ProductInfoProps {
  product: Product;
  onOpenReferral: () => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product, onOpenReferral }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors && product.colors.length > 0 ? product.colors[0] : null
  );
  
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const incrementQuantity = () => {
    if (quantity < (product.stockCount || 10)) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: "Added to cart!",
      description: `You'll earn ${Math.floor(product.price * quantity * 10)} loyalty points with this purchase!`,
    });
  };
  
  const handleToggleWishlist = () => {
    toggleItem(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col"
    >
      {product.isNew && (
        <span className="inline-block bg-wolly-magenta text-white text-xs font-semibold px-2 py-1 rounded-full mb-2">
          NEW
        </span>
      )}
      
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      
      <div className="flex items-center mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={16} 
              className={`${i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} mr-0.5`} 
            />
          ))}
        </div>
        <span className="text-sm ml-2">{product.rating} ({Math.floor((product.rating || 0) * 10)} reviews)</span>
      </div>
      
              <span className="text-2xl font-bold text-wolly-magenta mb-4">₹{product.price?.toFixed(2)}</span>
      
      <LoyaltyPoints product={product} quantity={quantity} />
      
      <p className="text-muted-foreground mb-6">
        {product.description}
      </p>
      
      {product.colors && product.colors.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Color</h3>
          <div className="flex space-x-2">
            {product.colors.map(color => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border ${
                  selectedColor === color 
                  ? 'ring-2 ring-wolly-magenta ring-offset-2' 
                  : 'ring-0'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Select ${color} color`}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center mb-6">
        <h3 className="font-medium mr-4">Quantity</h3>
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="h-9 w-9"
          >
            <Minus size={16} />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={incrementQuantity}
            disabled={quantity >= (product.stockCount || 10)}
            className="h-9 w-9"
          >
            <Plus size={16} />
          </Button>
        </div>
        
        {product.stockCount && product.stockCount < 10 && (
          <span className="ml-4 text-sm text-orange-600">
            Only {product.stockCount} left
          </span>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Button 
          size="lg" 
          className="bg-wolly-magenta hover:bg-wolly-magenta/90 text-white flex-1"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className={`border-wolly-pink button-hover ${
            isInWishlist(product.id || 0) 
              ? 'bg-wolly-pink/20 text-wolly-magenta' 
              : 'text-wolly-magenta'
          }`}
          onClick={handleToggleWishlist}
        >
          <Heart size={18} className={`mr-2 ${isInWishlist(product.id || 0) ? 'fill-wolly-magenta' : ''}`} />
          {isInWishlist(product.id || 0) ? 'In Wishlist' : 'Add to Wishlist'}
        </Button>
      </div>
      
      <div className="border-t border-border pt-4 mb-6">
        <div className="flex items-center text-sm mb-2">
          <span className="text-muted-foreground w-20">SKU:</span>
          <span>WW-{product.id?.toString().padStart(4, '0')}</span>
        </div>
        <div className="flex items-center text-sm mb-2">
          <span className="text-muted-foreground w-20">Category:</span>
          <Link to={`/shop/${product.category?.toLowerCase()}`} className="hover:text-wolly-magenta">
            {product.category}
          </Link>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-muted-foreground w-20">Tags:</span>
          <div className="flex flex-wrap gap-1">
            {product.tags?.map(tag => (
              <Link 
                key={tag} 
                to={`/shop/tag/${tag}`}
                className="hover:text-wolly-magenta"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-medium mr-4">Share:</span>
          <SocialShareButtons product={product} />
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-wolly-magenta"
          onClick={onOpenReferral}
        >
          <Share2 size={15} className="mr-2" />
          Refer & Earn
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductInfo;
