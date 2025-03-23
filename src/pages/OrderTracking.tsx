
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import OrderStatusSteps, { OrderStatus } from '@/components/order/OrderStatusSteps';
import OrderSummary from '@/components/order/OrderSummary';
import ShippingUpdateBanner from '@/components/order/ShippingUpdateBanner';
import OrderDetailsCard from '@/components/order/OrderDetailsCard';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || '1234567';
  
  // Mock data - in a real app, you would fetch this based on the order number
  const orderStatus: OrderStatus = 'shipped';
  const orderDate = 'May 10, 2023';
  const estimatedDelivery = 'May 15, 2023';
  
  // Mock order items
  const orderItems = [
    {
      name: 'Wollyway Hand Band - Limited Edition',
      color: 'Red',
      size: 'Medium',
      quantity: 1,
      price: 24.99,
      image: 'https://placehold.co/100'
    },
    {
      name: 'Custom Knot Keychain',
      color: 'Blue',
      size: undefined,
      quantity: 2,
      price: 34.98,
      image: 'https://placehold.co/100'
    }
  ];
  
  // Order totals
  const subtotal = 59.97;
  const shipping = 'Free';
  const tax = 4.80;
  const total = 64.77;

  // Shipping update message
  const shippingMessage = 'Your package has left our warehouse and is on its way to you!';

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
            <OrderSummary 
              orderDate={orderDate}
              orderNumber={orderNumber}
              estimatedDelivery={estimatedDelivery}
            />
            
            <OrderStatusSteps 
              orderStatus={orderStatus}
              orderDate={orderDate}
              estimatedDelivery={estimatedDelivery}
            />
            
            <ShippingUpdateBanner 
              message={shippingMessage}
              estimatedDelivery={estimatedDelivery}
            />
          </div>
          
          <OrderDetailsCard 
            items={orderItems}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
          />
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderTracking;
