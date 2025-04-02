
import React, { useState } from 'react';
import { X } from 'lucide-react';

type BannerType = 'promo' | 'sale' | 'new' | 'restock';

interface PromoBannerProps {
  type?: BannerType;
  message?: string;
  code?: string;
  dismissible?: boolean;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ 
  type = 'promo', 
  message, 
  code = 'FREESHIP',
  dismissible = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  // Define banner styles based on type
  const bannerStyles = {
    promo: 'bg-wolly-magenta text-white',
    sale: 'bg-red-500 text-white',
    new: 'bg-blue-500 text-white',
    restock: 'bg-green-500 text-white',
  };

  // Set default message based on type if none provided
  const defaultMessages = {
    promo: `Special offer: Get free shipping on orders over $50! Use code ${code} at checkout.`,
    sale: `Flash Sale: 20% off all items! Use code ${code} at checkout.`,
    new: 'New arrivals just landed! Check out our latest collection.',
    restock: 'Popular items back in stock! Shop now while supplies last.',
  };

  const displayMessage = message || defaultMessages[type];

  return (
    <div className={`py-3 px-4 text-center relative ${bannerStyles[type]}`}>
      <p className="text-sm font-medium">
        {displayMessage}
      </p>
      
      {dismissible && (
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default PromoBanner;
