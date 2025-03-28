
import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/pages/Shop';

interface ProductGalleryProps {
  product: Product;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ product }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl overflow-hidden"
    >
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-auto object-cover"
      />
    </motion.div>
  );
};

export default ProductGallery;
