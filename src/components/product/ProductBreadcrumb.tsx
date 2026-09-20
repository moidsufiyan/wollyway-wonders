"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Product } from '@/types/Product';

interface ProductBreadcrumbProps {
  product?: Partial<Product>;
  categoryPath?: string;
}

const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({ product, categoryPath }) => {
  const categoryName =
    typeof product?.category === 'object' && product?.category !== null
      ? ((product.category as any).name || (product.category as any).slug || '')
      : typeof product?.category === 'string'
      ? product.category
      : '';
  const displayCategory = categoryPath || categoryName;
  const categoryLink = displayCategory
    ? `/shop?category=${encodeURIComponent(displayCategory.toLowerCase())}`
    : '/shop';

  return (
    <div className="mb-6">
      <nav className="flex items-center text-sm text-muted-foreground flex-wrap">
        <Link href="/" className="hover:text-wolly-magenta flex items-center">
          <Home size={14} className="mr-1" />
          <span>Home</span>
        </Link>
        <ChevronRight size={14} className="mx-2" />
        <Link href="/shop" className="hover:text-wolly-magenta">
          Shop
        </Link>
        
        {displayCategory && (
          <>
            <ChevronRight size={14} className="mx-2" />
            <Link href={categoryLink} className="hover:text-wolly-magenta">
              {displayCategory}
            </Link>
          </>
        )}
        
        {product?.name && (
          <>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </>
        )}
      </nav>
    </div>
  );
};

export default ProductBreadcrumb;
