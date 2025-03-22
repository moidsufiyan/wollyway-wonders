
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-wolly-pink/10 filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-wolly-blush/20 filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block px-4 py-1.5 bg-wolly-pink/10 text-wolly-magenta rounded-full text-sm font-medium mb-6"
            >
              Handcrafted with love
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Uniquely Crafted <br className="hidden md:block" />
              <span className="text-gradient">Accessories</span> <br className="hidden md:block" />
              For Your Style
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Discover our collection of handmade knotted bands, keychains, and 
              accessories that blend craftsmanship with pop culture inspiration.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="bg-wolly-magenta hover:bg-wolly-magenta/90 text-white button-hover">
                <Link to="/shop">
                  Shop Collection <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-wolly-pink text-wolly-magenta hover:bg-wolly-pink/10 button-hover">
                <Link to="/custom">
                  Customize Your Own
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative w-full h-[30rem] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Handcrafted accessories" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wolly-magenta/30 to-transparent"></div>
              
              {/* Floating product highlights */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute top-10 -right-6 glass-card p-4 shadow-lg animate-float"
              >
                <div className="w-28 h-28 rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                    alt="Hand band" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2">
                  <p className="font-medium text-sm">Knotted Band</p>
                  <p className="text-wolly-magenta font-bold text-sm">$24.99</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-16 -left-6 glass-card p-4 shadow-lg animate-float animation-delay-500"
              >
                <div className="w-28 h-28 rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1611010344445-5f28a5a7414d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                    alt="Keychain" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2">
                  <p className="font-medium text-sm">Pop Keychain</p>
                  <p className="text-wolly-magenta font-bold text-sm">$19.99</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
