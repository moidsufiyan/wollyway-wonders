
import React from 'react';
import { Clock, Hash, Truck } from 'lucide-react';

interface OrderSummaryProps {
  orderDate: string;
  orderNumber: string;
  estimatedDelivery: string;
  showIcons?: boolean;
  className?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  orderDate, 
  orderNumber, 
  estimatedDelivery,
  showIcons = false,
  className = "flex justify-between mb-6"
}) => {
  return (
    <div className={className}>
      <div>
        {showIcons && <Clock size={16} className="mb-1 text-muted-foreground" />}
        <p className="text-muted-foreground">Order Placed</p>
        <p className="font-medium">{orderDate}</p>
      </div>
      <div>
        {showIcons && <Hash size={16} className="mb-1 text-muted-foreground" />}
        <p className="text-muted-foreground">Order Number</p>
        <p className="font-medium">#{orderNumber}</p>
      </div>
      <div>
        {showIcons && <Truck size={16} className="mb-1 text-muted-foreground" />}
        <p className="text-muted-foreground">Estimated Delivery</p>
        <p className="font-medium">{estimatedDelivery}</p>
      </div>
    </div>
  );
};

export default OrderSummary;
