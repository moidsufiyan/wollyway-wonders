
import React from 'react';
import { Truck, AlertTriangle, CheckCircle, Info } from 'lucide-react';

type BannerType = 'info' | 'success' | 'warning' | 'default';

interface ShippingUpdateBannerProps {
  message: string;
  estimatedDelivery: string;
  type?: BannerType;
  title?: string;
}

const ShippingUpdateBanner: React.FC<ShippingUpdateBannerProps> = ({ 
  message, 
  estimatedDelivery,
  type = 'default',
  title = 'Shipping Update'
}) => {
  // Define styles based on the banner type
  const bannerStyles = {
    default: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      title: 'text-blue-700',
      text: 'text-blue-600',
      icon: <Truck size={18} className="text-blue-500" />
    },
    info: {
      bg: 'bg-sky-50',
      border: 'border-sky-100',
      title: 'text-sky-700',
      text: 'text-sky-600',
      icon: <Info size={18} className="text-sky-500" />
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-100',
      title: 'text-green-700',
      text: 'text-green-600',
      icon: <CheckCircle size={18} className="text-green-500" />
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      title: 'text-amber-700',
      text: 'text-amber-600',
      icon: <AlertTriangle size={18} className="text-amber-500" />
    }
  };
  
  const style = bannerStyles[type];
  
  return (
    <div className={`mt-6 p-4 ${style.bg} rounded-lg border ${style.border}`}>
      <div className="flex items-start">
        <div className="mr-3 mt-1">
          {style.icon}
        </div>
        <div>
          <h3 className={`font-medium ${style.title}`}>{title}</h3>
          <p className={`text-sm ${style.text}`}>
            {message}
          </p>
          <p className={`text-sm ${style.text} mt-1`}>
            Expected delivery: {estimatedDelivery}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingUpdateBanner;
