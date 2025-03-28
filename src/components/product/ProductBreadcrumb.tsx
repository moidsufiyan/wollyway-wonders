
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/pages/Shop';

interface ProductBreadcrumbProps {
  product: Product;
}

const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({ product }) => {
  return (
    <div className="mb-6">
      <nav className="flex items-center text-sm text-muted-foreground">
        <Link to="/" className="hover:text-wolly-magenta">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-wolly-magenta">Shop</Link>
        <span className="mx-2">/</span>
        <Link to={`/shop/${product?.category.toLowerCase()}`} className="hover:text-wolly-magenta">{product?.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product?.name}</span>
      </nav>
    </div>
  );
};

export default ProductBreadcrumb;
