
import React from 'react';
import { Truck, ShieldCheck, RefreshCw } from 'lucide-react';

const FeatureCards: React.FC = () => {
  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
      <div className="p-6 border border-border rounded-xl">
        <Truck size={24} className="mx-auto mb-3 text-wolly-magenta" />
        <h3 className="font-medium mb-1">Free Shipping</h3>
        <p className="text-sm text-muted-foreground">On orders over $50</p>
      </div>
      <div className="p-6 border border-border rounded-xl">
        <ShieldCheck size={24} className="mx-auto mb-3 text-wolly-magenta" />
        <h3 className="font-medium mb-1">Secure Payment</h3>
        <p className="text-sm text-muted-foreground">Safe & protected checkout</p>
      </div>
      <div className="p-6 border border-border rounded-xl">
        <RefreshCw size={24} className="mx-auto mb-3 text-wolly-magenta" />
        <h3 className="font-medium mb-1">Easy Returns</h3>
        <p className="text-sm text-muted-foreground">30 day return policy</p>
      </div>
    </div>
  );
};

export default FeatureCards;
