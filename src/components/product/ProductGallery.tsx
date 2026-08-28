"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { Product } from '@/types/Product';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';

interface ProductGalleryProps {
  product: Product;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use real array from backend if available, fallback to single image
  const images = (product.images && product.images.length > 0) ? product.images : [product.image];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative group cursor-pointer">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl overflow-hidden aspect-square bg-gray-50 relative"
            >
              <img 
                src={images[currentImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== product.image) {
                    target.src = product.image;
                  }
                }}
              />
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    className="bg-white/80 p-2 rounded-full hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    className="bg-white/80 p-2 rounded-full hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
              <button 
                className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                aria-label="View full size"
              >
                <Maximize size={16} />
              </button>
            </motion.div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl border-none p-0 bg-transparent shadow-none">
          {/* Include visually hidden DialogTitle to satisfy accessibility requirement */}
          <DialogTitle className="sr-only">Product Gallery View</DialogTitle>
          <div className="flex items-center justify-center h-full relative">
            <img 
              src={images[currentImageIndex]} 
              alt={product.name} 
              className="max-h-[85vh] w-auto object-contain rounded-xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== product.image) {
                  target.src = product.image;
                }
              }}
            />
            {images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-4 bg-white/50 p-2 rounded-full hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-4 bg-white/50 p-2 rounded-full hover:bg-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`rounded-md overflow-hidden border-2 aspect-square ${
                currentImageIndex === index 
                  ? 'border-wolly-magenta' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img 
                src={image} 
                alt={`${product.name} thumbnail ${index + 1}`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== product.image) {
                    target.src = product.image;
                  }
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
