
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/pages/Shop';

interface RelatedProductsProps {
  products: Product[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  if (products.length === 0) return null;
  
  return (
    <div className="mt-20">
      <h2 className="text-2xl font-bold mb-8 text-center">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="group">
            <Link to={`/product/${product.id}`} className="block relative aspect-square rounded-xl overflow-hidden mb-3">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <h3 className="font-medium group-hover:text-wolly-magenta transition-colors">
              <Link to={`/product/${product.id}`}>{product.name}</Link>
            </h3>
            <span className="font-bold text-wolly-magenta">${product.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
