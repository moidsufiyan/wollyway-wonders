"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import OrderStatusSteps, { OrderStatus } from '@/components/order/OrderStatusSteps';
import OrderSummary from '@/components/order/OrderSummary';
import ShippingUpdateBanner from '@/components/order/ShippingUpdateBanner';
import OrderDetailsCard from '@/components/order/OrderDetailsCard';
import { useOrder } from '@/hooks/useOrders';

const OrderTracking = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get('id');

  const { data: order, isLoading, error } = useOrder(orderId || '');

  React.useEffect(() => {
    if (!orderId) {
      router.push('/profile');
    }
  }, [orderId, router]);

  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-24 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-8 w-8 text-wolly-magenta mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-24 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">We couldn't find an order with this ID or you don't have permission to view it.</p>
            <Button asChild className="bg-wolly-magenta hover:bg-wolly-magenta/90">
              <Link href="/profile">Back to Profile</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Map backend status to component status
  const mapStatus = (status: string): OrderStatus => {
    switch(status) {
      case 'CONFIRMED': return 'processing';
      case 'PROCESSING': return 'processing';
      case 'SHIPPED': return 'shipped';
      case 'DELIVERED': return 'delivered';
      case 'CANCELLED': return 'cancelled';
      case 'REFUNDED': return 'cancelled';
      default: return 'processing';
    }
  };

  const orderStatus = mapStatus(order.status);
  const orderDate = new Date(order.createdAt).toLocaleDateString();
  // Assume 5 days from order date for estimated delivery
  const estimatedDeliveryDate = new Date(order.createdAt);
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);
  const estimatedDelivery = estimatedDeliveryDate.toLocaleDateString();
  
  // Format order items
  const orderItems = order.items.map((item: any) => ({
    name: item.name,
    color: item.color || 'Standard',
    size: item.size,
    quantity: item.quantity,
    price: item.price,
    image: item.image || '/placeholder.png'
  }));
  
  const subtotal = order.financials.subtotal;
  const shipping = order.financials.shippingFee === 0 ? 'Free' : `₹${order.financials.shippingFee.toFixed(2)}`;
  const tax = order.financials.taxTotal;
  const total = order.financials.orderTotal;

  // Shipping update message
  const getShippingMessage = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'Your order is confirmed. We are preparing it for shipment.';
      case 'PROCESSING': return 'We are currently processing your order and preparing it for shipment.';
      case 'SHIPPED': return 'Your package has left our warehouse and is on its way to you!';
      case 'DELIVERED': return 'Your package has been delivered. Enjoy your WollyWay products!';
      case 'CANCELLED': return 'This order has been cancelled.';
      case 'REFUNDED': return 'This order has been refunded.';
      default: return 'We are processing your order.';
    }
  };
  const shippingMessage = getShippingMessage(order.status);

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
            <Link href="/profile" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Track Your Order</h1>
              <p className="text-muted-foreground">Order #{order.orderNumber}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-8">
            <OrderSummary 
              orderDate={orderDate}
              orderNumber={order.orderNumber}
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
