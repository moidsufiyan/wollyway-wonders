
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { type Product } from '@/types/Product';

type RecentlyViewedProps = {
  products: Product[];
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const RecentlyViewed = ({ products }: RecentlyViewedProps) => {
  if (!products.length) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {products.map(product => (
            <motion.div 
              key={product.id}
              variants={item}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-border"
            >
              <Link to={`/product/${product.id}`} className="block">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full aspect-square object-cover"
                />
              </Link>
              <div className="p-3">
                <Link 
                  to={`/product/${product.id}`}
                  className="block font-medium text-sm line-clamp-1 hover:text-wolly-magenta transition-colors"
                >
                  {product.name}
                </Link>
                <p className="text-wolly-magenta font-bold text-sm mt-1">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
