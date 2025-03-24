
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Product } from '@/pages/Shop';

type ProductComparisonProps = {
  products: Product[];
  onRemove: (id: number) => void;
  onClose: () => void;
};

const ProductComparison: React.FC<ProductComparisonProps> = ({ 
  products, 
  onRemove,
  onClose
}) => {
  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg"
    >
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Compare Products ({products.length})</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left w-1/5">Product</th>
                {products.map(product => (
                  <th key={product.id} className="p-2 text-center">
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted"
                        onClick={() => onRemove(product.id)}
                      >
                        <X size={12} />
                      </Button>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-20 h-20 object-cover mx-auto rounded-md"
                      />
                      <p className="text-sm font-medium mt-2">{product.name}</p>
                      <p className="text-sm font-bold text-wolly-magenta">${product.price.toFixed(2)}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-medium">Category</td>
                {products.map(product => (
                  <td key={product.id} className="p-2 text-center">
                    {product.category}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Rating</td>
                {products.map(product => (
                  <td key={product.id} className="p-2 text-center">
                    {product.rating}/5
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Color Options</td>
                {products.map(product => (
                  <td key={product.id} className="p-2 text-center">
                    <div className="flex justify-center gap-1">
                      {product.colors?.map(color => (
                        <span 
                          key={color} 
                          className="w-4 h-4 rounded-full inline-block" 
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Availability</td>
                {products.map(product => (
                  <td key={product.id} className="p-2 text-center">
                    {product.stockCount && product.stockCount > 0 
                      ? `In Stock (${product.stockCount})` 
                      : 'Out of Stock'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2"></td>
                {products.map(product => (
                  <td key={product.id} className="p-2 text-center">
                    <Button 
                      size="sm" 
                      className="w-full bg-wolly-magenta hover:bg-wolly-magenta/90"
                      onClick={() => window.location.href = `/product/${product.id}`}
                    >
                      View Details
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductComparison;
