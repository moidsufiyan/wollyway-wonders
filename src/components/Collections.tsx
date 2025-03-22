
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const collections = [
  {
    id: 1,
    name: "Hand Bands",
    description: "Colorful knotted bands for your wrist",
    image: "https://images.unsplash.com/photo-1603974372039-adc49044b6bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    link: "/collections/hand-bands",
  },
  {
    id: 2,
    name: "Keychains",
    description: "Unique keychains for your everyday carry",
    image: "https://images.unsplash.com/photo-1541778956252-457ec49a7e7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    link: "/collections/keychains",
  },
  {
    id: 3,
    name: "Accessories",
    description: "Handcrafted accessories for any occasion",
    image: "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    link: "/collections/accessories",
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const Collections = () => {
  return (
    <section className="bg-wolly-blush/20 py-20">
      <div className="section-container">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-wolly-pink/20 text-wolly-magenta rounded-full text-sm font-medium mb-4">
            Explore Our Collections
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Match</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through our carefully curated collections and find pieces that match your style and personality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeInUp}
              transition={{ delay: index * 0.2 }}
              className="relative group overflow-hidden rounded-2xl shadow-lg"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src={collection.image} 
                  alt={collection.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>
                <p className="mb-4 text-white/90">{collection.description}</p>
                <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <Button asChild className="bg-white text-wolly-magenta hover:bg-white/90 button-hover">
                    <Link to={collection.link}>
                      Shop Now <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
