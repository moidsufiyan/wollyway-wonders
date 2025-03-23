
import React from 'react';
import { Package, Truck, Home, Clock } from 'lucide-react';

export type OrderStatus = 'processing' | 'shipped' | 'delivered';

interface OrderStatusStepsProps {
  orderStatus: OrderStatus;
  orderDate: string;
  estimatedDelivery: string;
}

const OrderStatusSteps: React.FC<OrderStatusStepsProps> = ({ 
  orderStatus, 
  orderDate, 
  estimatedDelivery 
}) => {
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
          orderStatus === 'shipped' || orderStatus === 'delivered', 
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
  );
};

export default OrderStatusSteps;
