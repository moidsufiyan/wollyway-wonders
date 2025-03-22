
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            className="inline-block mb-8 relative"
          >
            <span className="text-[10rem] font-bold text-wolly-pink/20">404</span>
            <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-wolly-magenta">404</span>
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="outline" className="border-wolly-pink text-wolly-magenta button-hover">
              <Link to="/">
                <ArrowLeft size={16} className="mr-2" /> Go Back
              </Link>
            </Button>
            
            <Button asChild className="bg-wolly-magenta hover:bg-wolly-magenta/90 text-white button-hover">
              <Link to="/">
                <Home size={16} className="mr-2" /> Back to Home
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;
