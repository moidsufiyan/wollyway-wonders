
import React from 'react';
import { Truck } from 'lucide-react';

interface ShippingUpdateBannerProps {
  message: string;
  estimatedDelivery: string;
}

const ShippingUpdateBanner: React.FC<ShippingUpdateBannerProps> = ({ 
  message, 
  estimatedDelivery 
}) => {
  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-start">
        <div className="mr-3 mt-1 text-blue-500">
          <Truck size={18} />
        </div>
        <div>
          <h3 className="font-medium text-blue-700">Shipping Update</h3>
          <p className="text-sm text-blue-600">
            {message}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Expected delivery: {estimatedDelivery}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingUpdateBanner;
