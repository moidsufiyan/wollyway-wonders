
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, BookmarkPlus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { type Product } from '@/types/Product';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import SizeGuide from '@/components/SizeGuide';
import { useCart } from '@/contexts/CartContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

export type ProductGridProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSaveForLater?: (product: Product) => void;
  onRemoveFromWishlist?: (productId: string) => void;
  showRemoveButton?: boolean;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ProductGrid = ({ products, onAddToCart, onSaveForLater, onRemoveFromWishlist, showRemoveButton }: ProductGridProps) => {
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { addProduct } = useRecentlyViewed();
  const { toast } = useToast();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const handleToggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isInWishlist(product.id)) {
      removeItem(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist`,
        duration: 3000,
      });
    } else {
      addItem(product);
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist`,
        duration: 3000,
      });
    }
  };

  const handleQuickView = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    setQuickViewProduct(product);
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : '');
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
    addProduct(product); // Add to recently viewed
  };

  const handleQuickAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart(product);
  };

  const handleSaveForLater = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    if (onSaveForLater) {
      onSaveForLater(product);
    }
  };

  const handleRemoveFromWishlist = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(product.id);
    }
  };

  const oneClickCheckout = (product: Product) => {
    addToCart(product, 1);
    toast({
      title: "Express checkout initiated",
      description: "Proceeding to checkout with saved information",
      duration: 3000,
    });
    // Navigate to checkout page with a small delay to allow toast to be seen
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 1500);
  };

  const getStockLabel = (product: Product) => {
    if (!product.stockCount && product.stockCount !== 0) return null;
    
    if (product.stockCount === 0) {
      return <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>;
    } else if (product.stockCount < 5) {
      return <Badge variant="outline" className="absolute top-2 right-2 bg-amber-50 text-amber-600 border-amber-200">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="absolute top-2 right-2 bg-green-50 text-green-600 border-green-200">In Stock</Badge>;
    }
  };

  return (
    <>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {products.map(product => (
          <motion.div 
            key={product.id}
            variants={item}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-border dark:border-gray-700 relative group"
          >
            {getStockLabel(product)}
            
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.isNew && (
                <Badge className="bg-wolly-magenta">New</Badge>
              )}
              {product.isFeatured && (
                <Badge className="bg-purple-600">Featured</Badge>
              )}
            </div>
            
            <Link to={`/product/${product.id}`} className="block relative">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
                  {showRemoveButton ? (
                    <button
                      onClick={(e) => handleRemoveFromWishlist(product, e)}
                      className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Heart size={16} className="fill-red-500" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleToggleWishlist(product, e)}
                      className={`bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-wolly-magenta hover:text-white transition-colors ${
                        isInWishlist(product.id) ? 'text-wolly-magenta' : ''
                      }`}
                      aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart 
                        size={16} 
                        className={isInWishlist(product.id) ? "fill-wolly-magenta" : ""}
                      />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => handleQuickView(product, e)}
                    className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-wolly-magenta hover:text-white transition-colors"
                    aria-label="Quick view"
                  >
                    <Eye size={16} />
                  </button>
                  
                  {onSaveForLater && (
                    <button
                      onClick={(e) => handleSaveForLater(product, e)}
                      className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-wolly-magenta hover:text-white transition-colors"
                      aria-label="Save for later"
                    >
                      <BookmarkPlus size={16} />
                    </button>
                  )}
                </div>
              </div>
            </Link>
            
            <div className="p-4">
              <div className="flex items-center mb-1">
                <div className="flex items-center text-yellow-400 mr-1">
                  <Star size={14} className="fill-yellow-400" />
                </div>
                <span className="text-xs text-muted-foreground dark:text-gray-400">
                  {product.rating.toFixed(1)} {product.reviews && `(${product.reviews})`}
                </span>
              </div>
              
              <Link 
                to={`/product/${product.id}`}
                className="block font-medium text-sm line-clamp-1 hover:text-wolly-magenta transition-colors mb-1"
              >
                {product.name}
              </Link>
              
              <div className="flex items-center justify-between">
                <p className="text-wolly-magenta font-bold">
                  ${product.price.toFixed(2)}
                </p>
                
                <button
                  onClick={(e) => handleQuickAddToCart(product, e)}
                  className="text-gray-600 dark:text-gray-300 hover:text-wolly-magenta transition-colors"
                  aria-label="Add to cart"
                  disabled={product.stockCount === 0}
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {quickViewProduct && (
        <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
          <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative">
                <img 
                  src={quickViewProduct.image} 
                  alt={quickViewProduct.name} 
                  className="w-full h-full object-cover"
                />
                {getStockLabel(quickViewProduct)}
              </div>
              
              <div className="p-6">
                <DialogTitle className="text-xl font-bold mb-1">
                  {quickViewProduct.name}
                </DialogTitle>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < Math.round(quickViewProduct.rating) ? "fill-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {quickViewProduct.reviews && `(${quickViewProduct.reviews} reviews)`}
                  </span>
                </div>
                
                <DialogDescription className="mb-4 line-clamp-3">
                  {quickViewProduct.description || "No description available."}
                </DialogDescription>
                
                <div className="text-xl font-bold text-wolly-magenta mb-4">
                  ${quickViewProduct.price.toFixed(2)}
                </div>
                
                {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {quickViewProduct.colors.map(color => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border ${
                            selectedColor === color 
                            ? 'ring-2 ring-wolly-magenta ring-offset-2' 
                            : 'ring-0'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                          aria-label={`Select ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Size</h4>
                      <button 
                        className="text-xs text-wolly-magenta underline"
                        onClick={() => setShowSizeGuide(true)}
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickViewProduct.sizes.map(size => (
                        <button
                          key={size}
                          className={`px-3 py-1 border rounded-md text-sm ${
                            selectedSize === size 
                            ? 'bg-wolly-magenta text-white border-wolly-magenta' 
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                          }`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 mt-6">
                  <Button
                    className="w-full bg-wolly-magenta hover:bg-wolly-magenta/90"
                    disabled={quickViewProduct.stockCount === 0}
                    onClick={() => {
                      onAddToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => oneClickCheckout(quickViewProduct)}
                    disabled={quickViewProduct.stockCount === 0}
                  >
                    <Zap size={16} className="mr-2" />
                    One-Click Checkout
                  </Button>
                  
                  <div className="flex gap-2">
                    {showRemoveButton ? (
                      <Button
                        className="w-1/2"
                        variant="ghost"
                        onClick={(e) => {
                          if (onRemoveFromWishlist) onRemoveFromWishlist(quickViewProduct.id);
                          setQuickViewProduct(null);
                        }}
                      >
                        <Heart 
                          size={16} 
                          className="mr-2 fill-red-500 text-red-500"
                        />
                        Remove
                      </Button>
                    ) : (
                      <Button
                        className="w-1/2"
                        variant="ghost"
                        onClick={(e) => {
                          handleToggleWishlist(quickViewProduct, e);
                          setQuickViewProduct(null);
                        }}
                      >
                        <Heart 
                          size={16} 
                          className={`mr-2 ${isInWishlist(quickViewProduct.id) ? "fill-wolly-magenta text-wolly-magenta" : ""}`}
                        />
                        Wishlist
                      </Button>
                    )}
                    
                    {onSaveForLater && (
                      <Button
                        className="w-1/2"
                        variant="ghost"
                        onClick={(e) => {
                          if (onSaveForLater) onSaveForLater(quickViewProduct);
                          setQuickViewProduct(null);
                        }}
                      >
                        <BookmarkPlus size={16} className="mr-2" />
                        Save for Later
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-4">
                  {quickViewProduct.stockCount === 0 ? (
                    <span className="text-red-500">Out of stock</span>
                  ) : quickViewProduct.stockCount && quickViewProduct.stockCount < 5 ? (
                    <span className="text-amber-600">Only {quickViewProduct.stockCount} left in stock</span>
                  ) : (
                    <span className="text-green-600">In stock</span>
                  )}
                </div>
              </div>
            </div>
            
            <DialogClose className="absolute top-4 right-4" />
          </DialogContent>
        </Dialog>
      )}
      
      <Dialog open={showSizeGuide} onOpenChange={setShowSizeGuide}>
        <DialogContent>
          <DialogTitle>Size Guide</DialogTitle>
          <SizeGuide />
          <DialogClose className="absolute top-4 right-4" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductGrid;
