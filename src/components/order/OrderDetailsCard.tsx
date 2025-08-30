
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  name: string;
  color: string;
  size?: string;
  quantity: number;
  price: number;
  image: string;
}

interface OrderDetailsCardProps {
  items: OrderItem[];
  subtotal: number;
  shipping: string;
  tax: number;
  total: number;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({
  items,
  subtotal,
  shipping,
  tax,
  total
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6">
      <h2 className="font-semibold text-lg mb-4">Order Details</h2>
      
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="bg-gray-50 rounded-md h-16 w-16 flex-shrink-0 overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                Color: {item.color}{item.size ? `, Size: ${item.size}` : ''}
              </p>
              <p className="text-sm">Qty: {item.quantity}</p>
            </div>
                            <div className="font-semibold">₹{item.price.toFixed(2)}</div>
          </div>
        ))}
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-muted-foreground">Subtotal</p>
            <p>${subtotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-foreground">Shipping</p>
            <p>{shipping}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-foreground">Tax</p>
            <p>${tax.toFixed(2)}</p>
          </div>
          <div className="flex justify-between font-bold">
            <p>Total</p>
            <p>${total.toFixed(2)}</p>
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
  );
};

export default OrderDetailsCard;
