
import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductBundle, { type Bundle } from '@/components/ProductBundle';

// Sample bundles data - in a real app, fetch from API
const sampleBundles: Bundle[] = [
  {
    id: 'bundle-1',
    name: 'Superhero Fan Pack',
    description: 'Perfect gift for superhero enthusiasts! Get our most popular superhero-themed items at a special bundle price.',
    products: [
      {
        id: 1,
        name: "Super Hero Keychain",
        price: 19.99,
        image: "/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png",
        category: "Keychains",
        tags: ["superhero", "black", "red", "white"],
        rating: 4.5,
        isNew: true,
        colors: ["black", "red", "white"],
        description: "Handcrafted superhero themed keychain made with premium materials. Comes with metal clasp.",
      },
      {
        id: 3,
        name: "Batman Inspired Band",
        price: 22.99,
        image: "/lovable-uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png",
        category: "Bands",
        tags: ["superhero", "batman", "black", "yellow"],
        rating: 4.7,
        colors: ["black", "yellow"],
        description: "Superhero-inspired handwoven band with iconic pattern. Durable and stylish.",
      }
    ],
    discountPercentage: 15,
    featured: true
  },
  {
    id: 'bundle-2',
    name: 'Friendship Gift Set',
    description: 'Show your friends you care with this special bundle of friendship bands and accessories.',
    products: [
      {
        id: 2,
        name: "Friendship Bracelets Set",
        price: 24.99,
        image: "/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png",
        category: "Bracelets",
        tags: ["friendship", "wristband", "colorful"],
        rating: 4.8,
        colors: ["multicolor"],
        description: "Set of handwoven friendship bands with custom designs. Perfect gift for friends.",
      },
      {
        id: 1,
        name: "Super Hero Keychain",
        price: 19.99,
        image: "/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png",
        category: "Keychains",
        tags: ["superhero", "black", "red", "white"],
        rating: 4.5,
        colors: ["black", "red", "white"],
        description: "Handcrafted superhero themed keychain made with premium materials. Comes with metal clasp.",
      }
    ],
    discountPercentage: 10
  }
];

const Bundles = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-10 text-center">
              <div className="inline-block p-3 bg-wolly-pink/20 rounded-full mb-4">
                <Package className="text-wolly-magenta" size={28} />
              </div>
              <h1 className="text-4xl font-bold mb-4">Special Product Bundles</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get more value with our carefully curated product bundles. Save up to 15% when you buy these items together!
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
              {sampleBundles.map(bundle => (
                <ProductBundle key={bundle.id} bundle={bundle} />
              ))}
            </div>
            
            <div className="mt-16 bg-gray-50 rounded-xl p-8 border border-border">
              <div className="flex flex-col md:flex-row items-center">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <Gift size={48} className="text-wolly-magenta mx-auto md:mx-0" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">Looking for the perfect gift?</h2>
                  <p className="text-muted-foreground mb-4">
                    We can create custom bundles for special occasions like birthdays, anniversaries, or corporate events.
                    Contact our team to discuss your requirements.
                  </p>
                  <a 
                    href="/contact" 
                    className="text-wolly-magenta hover:text-wolly-magenta/90 font-medium inline-flex items-center"
                  >
                    Contact us for custom bundles
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Bundles;
