
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

// Sample product data focused on hand-knitting
const featuredProducts = [
  {
    id: 1,
    name: "Cosmic Wave Knitted Band",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1617006898062-3575ca439551?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Hand Knitted Bands",
    isNew: true,
  },
  {
    id: 2,
    name: "Galaxy Knitted Keychain",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1622060520458-0d30e8c18cf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Hand Knitted Keychains",
    isNew: false,
  },
  {
    id: 3,
    name: "Sunset Melody Knitted Band",
    price: 22.99,
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Hand Knitted Bands",
    isNew: true,
  },
  {
    id: 4,
    name: "Cozy Winter Knitted Scarf",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1625591338875-e2cca9de80a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Hand Knitted Accessories",
    isNew: false,
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const ProductCard = ({ product }: { product: typeof featuredProducts[0] }) => {
  return (
    <motion.div variants={item} className="group">
      <div className="product-image-container aspect-square mb-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Button className="bg-white hover:bg-white/90 text-wolly-magenta rounded-full shadow-md button-hover">
              Quick View
            </Button>
            <Button variant="ghost" size="icon" className="bg-white hover:bg-white/90 text-wolly-magenta rounded-full shadow-md ml-2">
              <Heart size={18} />
            </Button>
          </div>
        </div>
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-wolly-magenta text-white text-xs font-bold px-2 py-1 rounded-full">
            NEW
          </span>
        )}
      </div>
      <div className="text-center">
        <span className="text-xs uppercase text-muted-foreground tracking-wider">{product.category}</span>
        <h3 className="font-medium mt-1 text-foreground group-hover:text-wolly-magenta transition-colors duration-300">{product.name}</h3>
        <p className="font-bold text-wolly-magenta mt-1">${product.price.toFixed(2)}</p>
      </div>
    </motion.div>
  );
};

const FeaturedProducts = () => {
  return (
    <section className="section-container">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-wolly-pink/10 text-wolly-magenta rounded-full text-sm font-medium mb-4">
          Featured Collection
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Bestsellers</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover our most loved hand-knitted pieces. Each item is carefully crafted with premium yarn and attention to detail.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {featuredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>

      <div className="mt-16 text-center">
        <Button asChild size="lg" className="bg-wolly-magenta hover:bg-wolly-magenta/90 text-white button-hover">
          <Link to="/shop">
            View All Knitted Products <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default FeaturedProducts;
