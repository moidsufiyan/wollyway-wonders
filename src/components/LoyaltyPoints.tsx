
import React from 'react';
import { Star, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Product } from '@/types/Product';

interface LoyaltyPointsProps {
  product: Product;
  quantity: number;
}

const LoyaltyPoints: React.FC<LoyaltyPointsProps> = ({ product, quantity }) => {
  // Calculate points - typically 10 points per 100 rupees spent
  const pointsEarned = Math.floor((product.price * quantity) / 10);
  
  return (
    <div className="mb-4">
      <Card className="bg-wolly-pink/10 border-wolly-pink">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-wolly-magenta mr-2 fill-wolly-magenta" />
              <span className="text-sm font-medium">Earn <span className="text-wolly-magenta font-bold">{pointsEarned} points</span> with this purchase</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button aria-label="More info about loyalty points">
                    <Info className="h-4 w-4 text-muted-foreground hover:text-wolly-magenta" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">
                    Earn 10 points for every $1 spent. 
                    Redeem points for discounts, free shipping, or exclusive products.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyPoints;
