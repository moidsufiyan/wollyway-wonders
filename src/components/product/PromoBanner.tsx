
import React from 'react';

const PromoBanner: React.FC = () => {
  return (
    <div className="bg-wolly-magenta text-white py-3 px-4 text-center">
      <p className="text-sm font-medium">
        Special offer: Get free shipping on orders over $50! Use code <span className="font-bold">FREESHIP</span> at checkout.
      </p>
    </div>
  );
};

export default PromoBanner;
