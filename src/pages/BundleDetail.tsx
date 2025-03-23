
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Plus, 
  Check,
  ShoppingCart, 
  Heart,
  Share2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type Bundle, type BundleProduct } from '@/components/ProductBundle';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

// Sample bundles data - in a real app, fetch from API
const sampleBundles: Bundle[] = [
  {
    id: 'bundle-1',
    name: 'Superhero Fan Pack',
    description: 'Perfect gift for superhero enthusiasts! Get our most popular superhero-themed items at a special bundle price.',
    products: [
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
      },
      {
        id: 3,
        name: "Batman Inspired Band",
        price: 22.99,
        image: "/lovable-uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png",
        category: "Bands",
        tags: ["superhero", "batman", "black", "yellow"],
        rating: 4.7,
        colors: ["black", "yellow"],
        description: "Superhero-inspired handwoven band with iconic pattern. Durable and stylish.",
      }
    ],
    discountPercentage: 15,
    featured: true
  },
  {
    id: 'bundle-2',
    name: 'Friendship Gift Set',
    description: 'Show your friends you care with this special bundle of friendship bands and accessories.',
    products: [
      {
        id: 2,
        name: "Friendship Bracelets Set",
        price: 24.99,
        image: "/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png",
        category: "Bracelets",
        tags: ["friendship", "wristband", "colorful"],
        rating: 4.8,
        colors: ["multicolor"],
        description: "Set of handwoven friendship bands with custom designs. Perfect gift for friends.",
      },
      {
        id: 1,
        name: "Super Hero Keychain",
        price: 19.99,
        image: "/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png",
        category: "Keychains",
        tags: ["superhero", "black", "red", "white"],
        rating: 4.5,
        colors: ["black", "red", "white"],
        description: "Handcrafted superhero themed keychain made with premium materials. Comes with metal clasp.",
      }
    ],
    discountPercentage: 10
  }
];

const BundleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  
  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      if (id) {
        const foundBundle = sampleBundles.find(b => b.id === id);
        setBundle(foundBundle || null);
      }
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [id]);
  
  const handleAddBundleToCart = () => {
    if (bundle) {
      // Add each product in the bundle to the cart
      bundle.products.forEach(product => {
        addItem(product, 1);
      });
    }
  };
  
  // Calculate original total price and discounted price
  const originalTotal = bundle?.products.reduce((sum, product) => sum + product.price, 0) || 0;
  const discountedTotal = bundle ? originalTotal * (1 - bundle.discountPercentage / 100) : 0;
  const savings = originalTotal - discountedTotal;
  
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 section-container">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse">Loading bundle details...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!bundle) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 section-container flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Bundle Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The bundle you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/bundles">
              <ArrowLeft size={16} className="mr-2" /> Back to Bundles
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
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-wolly-magenta">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/bundles" className="hover:text-wolly-magenta">Bundles</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{bundle.name}</span>
          </nav>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Bundle Header */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <Package className="text-wolly-magenta mr-2" size={24} />
              <h1 className="text-3xl font-bold">{bundle.name}</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {bundle.description}
            </p>
          </div>
          
          {/* Bundle Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {bundle.products.map((product) => (
              <div key={product.id} className="border border-border rounded-xl overflow-hidden bg-white">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-1/3 aspect-square">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 sm:w-2/3 flex flex-col justify-between">
                    <div>
                      <Link to={`/product/${product.id}`} className="text-lg font-medium hover:text-wolly-magenta">
                        {product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.category}
                      </p>
                      {product.description && (
                        <p className="text-sm mb-4">{product.description}</p>
                      )}
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="font-bold">${product.price.toFixed(2)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <Link to={`/product/${product.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pricing Summary */}
          <div className="bg-gray-50 rounded-xl p-6 border border-border mb-8">
            <h2 className="text-xl font-bold mb-4">Bundle Pricing Summary</h2>
            <div className="space-y-3 mb-4">
              {bundle.products.map((product) => (
                <div key={product.id} className="flex justify-between">
                  <span className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2" />
                    {product.name}
                  </span>
                  <span>${product.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Value:</span>
                <span className="line-through">${originalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bundle Discount ({bundle.discountPercentage}%):</span>
                <span className="text-green-600">-${savings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Bundle Price:</span>
                <span className="text-wolly-magenta text-xl">${discountedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-wolly-magenta hover:bg-wolly-magenta/90 flex-1"
              onClick={handleAddBundleToCart}
            >
              <ShoppingCart size={18} className="mr-2" />
              Add Bundle to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Share2 size={18} className="mr-2" />
              Share Bundle
            </Button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default BundleDetail;
