"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mapProductDetailToUI } from '@/types/Product';
import ProductDetailsTabs from '@/components/ProductDetailsTabs';
import ProductQA from '@/components/ProductQA';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import FeatureCards from '@/components/product/FeatureCards';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import PromoBanner from '@/components/product/PromoBanner';
import { useProductDetails } from '@/hooks/useProducts';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>(); // 'id' from route param is actually the slug 
  const { data: productDetailDTO, isLoading: loading, error } = useProductDetails(id);

  // Map to UI model
  const product = productDetailDTO ? mapProductDetailToUI(productDetailDTO) : null;
  
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 section-container flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/shop">
              <ArrowLeft size={16} className="mr-2" /> Back to Shop
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 section-container">
        <PromoBanner />
        
        <ProductBreadcrumb product={product} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ProductGallery product={product} />
          <ProductInfo 
            product={product} 
            onOpenReferral={() => {}} 
          />
        </div>
        
        <ProductDetailsTabs product={product} />
        
        <ProductQA productId={product.id} />
        
        <FeatureCards />
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;

