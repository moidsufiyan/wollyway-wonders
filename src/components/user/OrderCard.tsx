
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Package, Truck, AlertCircle, CheckCircle } from 'lucide-react';
import { Order } from '@/types/order';

interface OrderCardProps {
  order: Order;
  onViewDetails: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewDetails,
}) => {
  // Status icon based on order status
  const getStatusIcon = () => {
    switch (order.status) {
      case 'pending':
        return <AlertCircle size={18} className="text-amber-500" />;
      case 'processing':
        return <Package size={18} className="text-blue-500" />;
      case 'shipped':
        return <Truck size={18} className="text-purple-500" />;
      case 'delivered':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'cancelled':
        return <AlertCircle size={18} className="text-red-500" />;
      default:
        return <Package size={18} className="text-gray-500" />;
    }
  };

  // Status label with appropriate color
  const getStatusLabel = () => {
    const statusClasses = {
      pending: 'bg-amber-100 text-amber-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[order.status]}`}>
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </span>
    );
  };

  // Format the order date
  const orderDate = new Date(order.createdAt);
  const formattedDate = formatDistanceToNow(orderDate, { addSuffix: true });

  return (
    <Card className="mb-4">
      <CardContent className="p-5">
        <div className="flex flex-wrap gap-2 justify-between mb-3 pb-3 border-b">
          <div>
            <p className="font-medium">Order #{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">
              Placed {formattedDate}
            </p>
          </div>
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2">{getStatusLabel()}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Show up to 2 items + count of remaining items */}
          {order.items.slice(0, 2).map((item, index) => (
            <div key={item.id} className="flex items-center">
              <div className="h-12 w-12 rounded-md overflow-hidden border mr-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity} · ${item.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          
          {order.items.length > 2 && (
            <p className="text-sm text-muted-foreground">
              +{order.items.length - 2} more {order.items.length - 2 === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-3 border-t px-5 py-3">
        <div>
          <p className="font-medium">${order.totalPrice.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            {order.items.reduce((total, item) => total + item.quantity, 0)} items
          </p>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => onViewDetails(order.id)}>
          View Details
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderCard;
