
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Calculate shipping, total, etc.
  const shipping = items.length > 0 ? (subtotal >= 50 ? 0 : 5.99) : 0;
  const tax = subtotal * 0.08; // Assuming 8% tax rate
  const total = subtotal + shipping + tax;
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      // For demo, we could either redirect to login or just proceed
      navigate('/checkout');
    } else {
      navigate('/checkout');
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
            <ShoppingCart className="mr-3" size={32} />
            Your Shopping Cart
          </h1>
          
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="bg-gray-50 rounded-lg p-12 max-w-md mx-auto">
                <ShoppingBag size={48} className="mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-semibold mb-3">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Button
                  asChild
                  className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                >
                  <Link to="/shop">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between mb-4">
                      <span className="text-lg font-medium">
                        {items.length} {items.length === 1 ? 'Item' : 'Items'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Clear Cart
                      </Button>
                    </div>
                    
                    <Separator className="mb-6" />
                    
                    <div className="space-y-6">
                      {items.map(item => (
                        <div key={item.product.id} className="flex flex-col sm:flex-row">
                          <div className="sm:w-24 h-24 rounded-md overflow-hidden flex-shrink-0 mb-4 sm:mb-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 sm:ml-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between">
                              <div>
                                <h3 className="font-medium">
                                  <Link
                                    to={`/product/${item.product.id}`}
                                    className="hover:text-wolly-magenta"
                                  >
                                    {item.product.name}
                                  </Link>
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {item.product.category}
                                  {item.product.colors && (
                                    <span className="ml-2">
                                      Color: <span className="capitalize">{item.product.colors[0]}</span>
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="sm:text-right">
                                <span className="font-bold text-wolly-magenta">
                                  ₹{item.product.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus size={14} />
                                </Button>
                                <span className="w-10 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= (item.product.stockCount || 10)}
                                >
                                  <Plus size={14} />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.product.id)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
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
              </div>
              
              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-border p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <span>₹{shipping.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (18%)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-wolly-magenta text-xl">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Promo Code */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Promo Code</h3>
                    <div className="flex space-x-2">
                      <Input placeholder="Enter code" className="flex-1" />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full bg-wolly-magenta hover:bg-wolly-magenta/90"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <div className="mt-4 text-xs text-center text-muted-foreground">
                    <p>Secure checkout powered by Stripe</p>
                    <p className="mt-1">Free shipping on orders over $50</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
