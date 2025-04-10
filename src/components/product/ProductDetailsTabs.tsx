
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductReviewsSection from './ProductReviewsSection';
import { Review } from '@/types/review';

interface ProductDetailsTabsProps {
  description: string;
  specifications?: Record<string, string>;
  shippingInfo?: string;
  productId: string;
  showReviews?: boolean;
}

// Sample mock data for reviews - in a real app this would come from an API
const mockReviews: Review[] = [
  {
    id: '1',
    productId: 'product-1',
    userId: 'user-1',
    userName: 'Jane Smith',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    title: 'Absolutely love it!',
    comment: 'This product exceeded my expectations. The quality is excellent and it looks even better in person. Would definitely recommend to anyone considering it!',
    images: ['https://i.pravatar.cc/150?img=2', 'https://i.pravatar.cc/150?img=3'],
    createdAt: '2023-04-15T10:30:00Z',
    helpful: 12,
    verified: true,
  },
  {
    id: '2',
    productId: 'product-1',
    userId: 'user-2',
    userName: 'Mike Johnson',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    rating: 4,
    comment: 'Great product overall. The only reason I'm not giving 5 stars is because the shipping took longer than expected. Otherwise, very happy with my purchase.',
    createdAt: '2023-03-20T14:15:00Z',
    helpful: 5,
    verified: true,
  },
  {
    id: '3',
    productId: 'product-1',
    userId: 'user-3',
    userName: 'Sarah Williams',
    rating: 3,
    comment: 'Average product. It does what it's supposed to do, but nothing exceptional. The material could be better quality for the price.',
    createdAt: '2023-03-10T09:45:00Z',
    helpful: 2,
    verified: false,
  },
];

const ratingsBreakdown = {
  5: 15,
  4: 8,
  3: 4,
  2: 2,
  1: 1,
};

const ProductDetailsTabs: React.FC<ProductDetailsTabsProps> = ({
  description,
  specifications,
  shippingInfo,
  productId,
  showReviews = true,
}) => {
  return (
    <div className="mt-8">
      <Tabs defaultValue="description">
        <TabsList className="border-b w-full justify-start mb-6">
          <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-wolly-magenta">
            Description
          </TabsTrigger>
          {specifications && Object.keys(specifications).length > 0 && (
            <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-wolly-magenta">
              Specifications
            </TabsTrigger>
          )}
          {shippingInfo && (
            <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-wolly-magenta">
              Shipping & Returns
            </TabsTrigger>
          )}
          {showReviews && (
            <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-wolly-magenta">
              Reviews
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="description" className="py-4">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
        </TabsContent>
        
        {specifications && Object.keys(specifications).length > 0 && (
          <TabsContent value="specifications" className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="flex border-b pb-2">
                  <div className="font-medium w-1/3">{key}</div>
                  <div className="w-2/3">{value}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
        
        {shippingInfo && (
          <TabsContent value="shipping" className="py-4">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: shippingInfo }} />
          </TabsContent>
        )}
        
        {showReviews && (
          <TabsContent value="reviews" className="py-4">
            <ProductReviewsSection
              productId={productId}
              reviews={mockReviews}
              averageRating={4.1}
              totalReviews={30}
              ratingsBreakdown={ratingsBreakdown}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ProductDetailsTabs;
