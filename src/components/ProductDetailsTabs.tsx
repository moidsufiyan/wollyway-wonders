
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Info, Truck, RotateCcw } from 'lucide-react';
import { type Product } from '@/pages/Shop';
import { motion } from 'framer-motion';

type ProductDetailsTabsProps = {
  product: Product;
};

const ProductDetailsTabs: React.FC<ProductDetailsTabsProps> = ({ product }) => {
  // Sample reviews - in real app would come from API
  const reviews = [
    { id: 1, author: 'Sarah M.', rating: 5, date: '2023-04-15', text: 'Absolutely love this product! The quality exceeded my expectations and it arrived quickly.' },
    { id: 2, author: 'John D.', rating: 4, date: '2023-03-22', text: 'Great product for the price. Would definitely recommend to friends.' },
    { id: 3, author: 'Amanda K.', rating: 5, date: '2023-02-10', text: 'Perfect gift for my friend. The colors are vibrant and the craftsmanship is excellent.' }
  ];

  // Sample shipping info - in real app would come from API/config
  const shippingInfo = {
    methods: [
      { name: 'Standard Shipping', price: 4.99, time: '3-5 business days' },
      { name: 'Express Shipping', price: 9.99, time: '1-2 business days' },
    ],
    returns: 'Free returns within 30 days of delivery. Item must be unused and in original packaging.'
  };

  return (
    <Tabs defaultValue="description" className="w-full mt-12">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="description" className="data-[state=active]:bg-wolly-pink/20">
          <Info className="mr-2 h-4 w-4" />
          Description
        </TabsTrigger>
        <TabsTrigger value="reviews" className="data-[state=active]:bg-wolly-pink/20">
          <Star className="mr-2 h-4 w-4" />
          Reviews
        </TabsTrigger>
        <TabsTrigger value="shipping" className="data-[state=active]:bg-wolly-pink/20">
          <Truck className="mr-2 h-4 w-4" />
          Shipping
        </TabsTrigger>
        <TabsTrigger value="returns" className="data-[state=active]:bg-wolly-pink/20">
          <RotateCcw className="mr-2 h-4 w-4" />
          Returns
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="description" className="pt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-4">Product Details</h3>
          <p className="text-muted-foreground mb-4">
            {product.description || 'No description available for this product.'}
          </p>
          
          {product.tags?.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="bg-muted px-3 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </TabsContent>
      
      <TabsContent value="reviews">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Customer Reviews</h3>
            <span className="flex items-center bg-wolly-pink/10 text-wolly-magenta px-3 py-1 rounded-full">
              <Star className="fill-wolly-magenta text-wolly-magenta mr-1 h-4 w-4" />
              {product.rating} / 5
            </span>
          </div>
          
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{review.author}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={`${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} mr-0.5`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          )}
        </motion.div>
      </TabsContent>
      
      <TabsContent value="shipping">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Shipping Methods</h4>
              <div className="space-y-2">
                {shippingInfo.methods.map((method, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.time}</p>
                    </div>
                    <p className="font-medium">${method.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Shipping Policy</h4>
              <p className="text-muted-foreground">
                Orders are typically processed within 1-2 business days. Shipping times are estimated 
                and may vary based on your location. You will receive a tracking number once your order ships.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">International Shipping</h4>
              <p className="text-muted-foreground">
                We currently ship to over 50 countries worldwide. International orders may be subject to 
                customs fees and import duties, which are the responsibility of the customer.
              </p>
            </div>
          </div>
        </motion.div>
      </TabsContent>
      
      <TabsContent value="returns">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-4">Returns & Exchanges</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Return Policy</h4>
              <p className="text-muted-foreground">{shippingInfo.returns}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">How to Return</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Log into your account and navigate to your order history.</li>
                <li>Select the order containing the item you wish to return.</li>
                <li>Follow the prompts to initiate a return.</li>
                <li>Print the prepaid return shipping label.</li>
                <li>Package the item securely and attach the shipping label.</li>
                <li>Drop off the package at any authorized shipping location.</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Refund Process</h4>
              <p className="text-muted-foreground">
                Once we receive and inspect your return, we will notify you of 
                the approval or rejection of your refund. If approved, your refund will 
                be processed and automatically applied to your original payment method within 
                5-10 business days.
              </p>
            </div>
          </div>
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};

export default ProductDetailsTabs;
