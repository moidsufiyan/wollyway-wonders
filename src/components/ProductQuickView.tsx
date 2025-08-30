
import React from 'react';
import { X, Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Product } from '@/types/Product';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Link } from 'react-router-dom';

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductQuickView = ({ product, open, onOpenChange }: ProductQuickViewProps) => {
  const [quantity, setQuantity] = React.useState(1);
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  
  // Reset state when product changes
  React.useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : null);
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
    }
  }, [product]);

  if (!product) return null;

  const incrementQuantity = () => {
    if (product && quantity < (product.stockCount || 10)) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      onOpenChange(false);
    }
  };
  
  const handleToggleWishlist = () => {
    if (product) {
      toggleItem(product);
    }
  };

  // Determine stock status
  const getStockStatus = () => {
    if (!product.stockCount) return 'In Stock';
    if (product.stockCount <= 0) return 'Out of Stock';
    if (product.stockCount < 5) return 'Low Stock';
    return 'In Stock';
  };

  const stockStatus = getStockStatus();
  const stockColor = 
    stockStatus === 'In Stock' ? 'bg-green-100 text-green-800' :
    stockStatus === 'Low Stock' ? 'bg-amber-100 text-amber-800' :
    'bg-red-100 text-red-800';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="aspect-square relative">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {product.isNew && (
              <Badge className="absolute top-4 left-4 bg-wolly-magenta">New</Badge>
            )}
          </div>
          
          {/* Product Details */}
          <div className="p-6 flex flex-col">
            <DialogTitle className="text-xl font-bold mb-2">{product.name}</DialogTitle>
            <div className="text-lg font-bold text-wolly-magenta mb-3">₹{product.price.toFixed(2)}</div>
            
            <Badge className={`mb-4 w-fit ${stockColor}`}>
              {stockStatus}
            </Badge>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {product.description || "A beautiful handcrafted item made with love and attention to detail."}
            </p>
            
            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-sm mb-2">Color</h3>
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
            
            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Size</h3>
                  <Button variant="link" className="text-xs p-0 h-auto" asChild>
                    <Link to="/size-guide" target="_blank">Size Guide</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`h-8 min-w-[32px] px-2 border rounded-md text-sm font-medium ${
                        selectedSize === size 
                        ? 'bg-wolly-magenta text-white border-wolly-magenta' 
                        : 'border-gray-300 hover:border-wolly-magenta'
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <h3 className="font-medium text-sm mr-4">Quantity</h3>
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-8 w-8"
                >
                  <Minus size={16} />
                </Button>
                <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={incrementQuantity}
                  disabled={product.stockCount !== undefined && quantity >= product.stockCount}
                  className="h-8 w-8"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto">
              <Button 
                className="flex-1 bg-wolly-magenta hover:bg-wolly-magenta/90"
                onClick={handleAddToCart}
                disabled={stockStatus === 'Out of Stock'}
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleToggleWishlist}
                className={isInWishlist(product.id) ? 'text-wolly-magenta' : ''}
              >
                <Heart size={16} className={isInWishlist(product.id) ? 'fill-wolly-magenta' : ''} />
              </Button>
            </div>
            
            <div className="mt-4 text-center">
              <Button variant="link" asChild className="text-sm">
                <Link to={`/product/${product.id}`}>View Full Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
