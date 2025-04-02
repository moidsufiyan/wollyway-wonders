
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Product } from '@/pages/Shop';

interface ProductBreadcrumbProps {
  product: Product;
}

const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({ product }) => {
  return (
    <div className="mb-6">
      <nav className="flex items-center text-sm text-muted-foreground flex-wrap">
        <Link to="/" className="hover:text-wolly-magenta flex items-center">
          <Home size={14} className="mr-1" />
          <span>Home</span>
        </Link>
        <ChevronRight size={14} className="mx-2" />
        <Link to="/shop" className="hover:text-wolly-magenta">
          Shop
        </Link>
        
        {product?.category && (
          <>
            <ChevronRight size={14} className="mx-2" />
            <Link 
              to={`/shop/${product.category.toLowerCase()}`} 
              className="hover:text-wolly-magenta"
            >
              {product.category}
            </Link>
          </>
        )}
        
        <ChevronRight size={14} className="mx-2" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {product?.name}
        </span>
      </nav>
    </div>
  );
};

export default ProductBreadcrumb;
