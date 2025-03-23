
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Truck, Home, CheckCircle, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Define the order status type for type safety
type OrderStatus = 'processing' | 'shipped' | 'delivered';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || '1234567';
  
  // Mock data - in a real app, you would fetch this based on the order number
  const orderStatus: OrderStatus = 'shipped'; // 'processing', 'shipped', 'delivered'
  const orderDate = 'May 10, 2023';
  const estimatedDelivery = 'May 15, 2023';
  
  const renderStatusStep = (step: string, label: string, completed: boolean, inProgress: boolean, icon: React.ReactNode) => {
    return (
      <div className="flex flex-col items-center">
        <div className={`rounded-full w-12 h-12 flex items-center justify-center ${
          completed ? 'bg-green-100 text-green-600' : 
          inProgress ? 'bg-blue-100 text-blue-600' : 
          'bg-gray-100 text-gray-400'
        }`}>
          {icon}
        </div>
        <p className="mt-2 text-sm font-medium">{step}</p>
        <p className={`text-xs ${completed || inProgress ? 'text-muted-foreground' : 'text-gray-400'}`}>
          {label}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center mb-6">
            <Link to="/account" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Track Your Order</h1>
              <p className="text-muted-foreground">Order #{orderNumber}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-8">
            <div className="flex justify-between mb-6">
              <div>
                <p className="text-muted-foreground">Order Placed</p>
                <p className="font-medium">{orderDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Order Number</p>
                <p className="font-medium">#{orderNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated Delivery</p>
                <p className="font-medium">{estimatedDelivery}</p>
              </div>
            </div>
            
            <div className="relative py-10">
              {/* Progress line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2 z-0">
                <div 
                  className="h-full bg-green-500 transition-all duration-500" 
                  style={{ 
                    width: orderStatus === 'processing' ? '25%' : 
                           orderStatus === 'shipped' ? '65%' : 
                           orderStatus === 'delivered' ? '100%' : '0%' 
                  }}
                />
              </div>
              
              {/* Status steps */}
              <div className="flex justify-between relative z-10">
                {renderStatusStep(
                  'Ordered', 
                  orderDate, 
                  true, 
                  false, 
                  <Package size={20} />
                )}
                
                {renderStatusStep(
                  'Processing', 
                  'May 11, 2023', 
                  ['shipped', 'delivered'].includes(orderStatus), 
                  orderStatus === 'processing', 
                  <Clock size={20} />
                )}
                
                {renderStatusStep(
                  'Shipped', 
                  'May 12, 2023', 
                  orderStatus === 'delivered', 
                  orderStatus === 'shipped', 
                  <Truck size={20} />
                )}
                
                {renderStatusStep(
                  'Delivered', 
                  estimatedDelivery, 
                  false, 
                  orderStatus === 'delivered', 
                  <Home size={20} />
                )}
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <div className="mr-3 mt-1 text-blue-500">
                  <Truck size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-blue-700">Shipping Update</h3>
                  <p className="text-sm text-blue-600">
                    Your package has left our warehouse and is on its way to you!
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Expected delivery: {estimatedDelivery}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 rounded-md h-16 w-16 flex-shrink-0 overflow-hidden">
                  <img 
                    src="https://placehold.co/100" 
                    alt="Product" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Wollyway Hand Band - Limited Edition</p>
                  <p className="text-sm text-muted-foreground">Color: Red, Size: Medium</p>
                  <p className="text-sm">Qty: 1</p>
                </div>
                <div className="font-semibold">$24.99</div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 rounded-md h-16 w-16 flex-shrink-0 overflow-hidden">
                  <img 
                    src="https://placehold.co/100" 
                    alt="Product" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Custom Knot Keychain</p>
                  <p className="text-sm text-muted-foreground">Color: Blue</p>
                  <p className="text-sm">Qty: 2</p>
                </div>
                <div className="font-semibold">$34.98</div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p>$59.97</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Shipping</p>
                  <p>Free</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Tax</p>
                  <p>$4.80</p>
                </div>
                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p>$64.77</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="outline">Download Invoice</Button>
              <Button variant="outline">Contact Support</Button>
              <Button 
                className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                asChild
              >
                <Link to="/shop">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderTracking;
