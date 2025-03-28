import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Minus, 
  Plus, 
  Heart, 
  Share2,
  Truck, 
  ShieldCheck, 
  RefreshCw,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Product } from '@/pages/Shop';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductDetailsTabs from '@/components/ProductDetailsTabs';
import SocialShareButtons from '@/components/SocialShareButtons';
import ProductQA from '@/components/ProductQA';
import ReferralProgram from '@/components/ReferralProgram';
import { useToast } from '@/hooks/use-toast';
import LoyaltyPoints from '@/components/LoyaltyPoints';

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
    description: "Handcrafted superhero themed keychain made with premium materials. Each piece is carefully created with attention to detail, featuring bold colors and durable construction. The metal clasp ensures secure attachment to your keys or bags.",
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
    description: "Set of handwoven friendship bands with custom designs. These bracelets are made with high-quality cotton threads and showcase intricate patterns. Perfect as a gift for friends or for adding a personal touch to your style.",
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
    description: "Superhero-inspired handwoven band with iconic pattern. This band features the instantly recognizable bat symbol woven with precision. Made from durable materials that will last, while maintaining a comfortable feel.",
    stockCount: 8
  }
];

const getRelatedProducts = (currentId: number): Product[] => {
  return allProducts
    .filter(product => product.id !== currentId)
    .slice(0, 4);
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showReferral, setShowReferral] = useState(false);
  
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (id) {
        const foundProduct = allProducts.find(p => p.id === parseInt(id));
        setProduct(foundProduct || null);
        
        if (foundProduct) {
          setRelatedProducts(getRelatedProducts(foundProduct.id));
          if (foundProduct.colors && foundProduct.colors.length > 0) {
            setSelectedColor(foundProduct.colors[0]);
          }
        }
      }
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);
  
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
      toast({
        title: "Added to cart!",
        description: `You'll earn ${Math.floor(product.price * quantity * 10)} loyalty points with this purchase!`,
      });
    }
  };
  
  const handleToggleWishlist = () => {
    if (product) {
      toggleItem(product);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 section-container flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/shop">
              <ArrowLeft size={16} className="mr-2" /> Back to Shop
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 section-container">
        <div className="bg-wolly-magenta text-white py-3 px-4 text-center">
          <p className="text-sm font-medium">
            Special offer: Get free shipping on orders over $50! Use code <span className="font-bold">FREESHIP</span> at checkout.
          </p>
        </div>
        
        <div className="mb-6">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-wolly-magenta">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-wolly-magenta">Shop</Link>
            <span className="mx-2">/</span>
            <Link to={`/shop/${product?.category.toLowerCase()}`} className="hover:text-wolly-magenta">{product?.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product?.name}</span>
          </nav>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-xl overflow-hidden"
          >
            <img 
              src={product?.image} 
              alt={product?.name} 
              className="w-full h-auto object-cover"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            {product?.isNew && (
              <span className="inline-block bg-wolly-magenta text-white text-xs font-semibold px-2 py-1 rounded-full mb-2">
                NEW
              </span>
            )}
            
            <h1 className="text-3xl font-bold mb-2">{product?.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={`${i < Math.floor(product?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} mr-0.5`} 
                  />
                ))}
              </div>
              <span className="text-sm ml-2">{product?.rating} ({Math.floor((product?.rating || 0) * 10)} reviews)</span>
            </div>
            
            <span className="text-2xl font-bold text-wolly-magenta mb-4">${product?.price?.toFixed(2)}</span>
            
            {product && <LoyaltyPoints product={product} quantity={quantity} />}
            
            <p className="text-muted-foreground mb-6">
              {product?.description}
            </p>
            
            {product?.colors && product.colors.length > 0 && (
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
                  disabled={quantity >= (product?.stockCount || 10)}
                  className="h-9 w-9"
                >
                  <Plus size={16} />
                </Button>
              </div>
              
              {product?.stockCount && product.stockCount < 10 && (
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
                  isInWishlist(product?.id || 0) 
                    ? 'bg-wolly-pink/20 text-wolly-magenta' 
                    : 'text-wolly-magenta'
                }`}
                onClick={handleToggleWishlist}
              >
                <Heart size={18} className={`mr-2 ${isInWishlist(product?.id || 0) ? 'fill-wolly-magenta' : ''}`} />
                {isInWishlist(product?.id || 0) ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
            
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex items-center text-sm mb-2">
                <span className="text-muted-foreground w-20">SKU:</span>
                <span>WW-{product?.id?.toString().padStart(4, '0')}</span>
              </div>
              <div className="flex items-center text-sm mb-2">
                <span className="text-muted-foreground w-20">Category:</span>
                <Link to={`/shop/${product?.category?.toLowerCase()}`} className="hover:text-wolly-magenta">
                  {product?.category}
                </Link>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground w-20">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {product?.tags?.map(tag => (
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
                onClick={() => setShowReferral(true)}
              >
                <Share2 size={15} className="mr-2" />
                Refer & Earn
              </Button>
            </div>
          </motion.div>
        </div>
        
        <ProductDetailsTabs product={product} />
        
        <ProductQA productId={product.id} />
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 border border-border rounded-xl">
            <Truck size={24} className="mx-auto mb-3 text-wolly-magenta" />
            <h3 className="font-medium mb-1">Free Shipping</h3>
            <p className="text-sm text-muted-foreground">On orders over $50</p>
          </div>
          <div className="p-6 border border-border rounded-xl">
            <ShieldCheck size={24} className="mx-auto mb-3 text-wolly-magenta" />
            <h3 className="font-medium mb-1">Secure Payment</h3>
            <p className="text-sm text-muted-foreground">Safe & protected checkout</p>
          </div>
          <div className="p-6 border border-border rounded-xl">
            <RefreshCw size={24} className="mx-auto mb-3 text-wolly-magenta" />
            <h3 className="font-medium mb-1">Easy Returns</h3>
            <p className="text-sm text-muted-foreground">30 day return policy</p>
          </div>
        </div>
        
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-8 text-center">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(relProduct => (
                <div key={relProduct.id} className="group">
                  <Link to={`/product/${relProduct.id}`} className="block relative aspect-square rounded-xl overflow-hidden mb-3">
                    <img 
                      src={relProduct.image} 
                      alt={relProduct.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <h3 className="font-medium group-hover:text-wolly-magenta transition-colors">
                    <Link to={`/product/${relProduct.id}`}>{relProduct.name}</Link>
                  </h3>
                  <span className="font-bold text-wolly-magenta">${relProduct.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <ReferralProgram open={showReferral} onOpenChange={setShowReferral} />
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
