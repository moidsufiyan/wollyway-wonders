
import React from 'react';

interface OrderSummaryProps {
  orderDate: string;
  orderNumber: string;
  estimatedDelivery: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  orderDate, 
  orderNumber, 
  estimatedDelivery 
}) => {
  return (
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
  );
};

export default OrderSummary;
