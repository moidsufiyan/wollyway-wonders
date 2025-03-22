
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

const Wishlist = () => {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  
  const handleMoveToCart = (productId: number) => {
    const product = items.find(item => item.id === productId);
    if (product) {
      addItem(product);
      removeItem(productId);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <Heart className="mr-3" size={32} />
            My Wishlist
          </h1>
          
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="bg-gray-50 rounded-lg p-12 max-w-md mx-auto">
                <Heart size={48} className="mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-semibold mb-3">Your wishlist is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Save items you love to your wishlist to come back and shop them anytime.
                </p>
                <Button
                  asChild
                  className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                >
                  <Link to="/shop">
                    Start Shopping
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6">
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-lg font-medium">
                      {items.length} {items.length === 1 ? 'Item' : 'Items'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearWishlist}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Clear Wishlist
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(product => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <Link
                          to={`/product/${product.id}`}
                          className="block aspect-square relative overflow-hidden"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                          />
                        </Link>
                        <div className="p-4">
                          <Link
                            to={`/product/${product.id}`}
                            className="block hover:text-wolly-magenta"
                          >
                            <h3 className="font-medium mb-1 truncate">{product.name}</h3>
                          </Link>
                          <p className="text-muted-foreground text-sm mb-2">{product.category}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-wolly-magenta">${product.price.toFixed(2)}</span>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(product.id)}
                                className="text-red-500 hover:bg-red-50 p-1 h-8 w-8"
                                title="Remove from wishlist"
                              >
                                <Trash2 size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveToCart(product.id)}
                                className="text-wolly-magenta hover:bg-wolly-pink/10 p-1 h-8 w-8"
                                title="Move to cart"
                              >
                                <ShoppingCart size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center"
                >
                  <Link to="/shop">
                    <ArrowLeft size={16} className="mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Wishlist;
