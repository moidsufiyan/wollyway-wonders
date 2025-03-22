
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Collections from '@/components/Collections';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import { motion, useScroll, useSpring } from 'framer-motion';

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-wolly-pink z-50 origin-left"
        style={{ scaleX }}
      />

      <Navbar />
      <Hero />
      <FeaturedProducts />
      <Collections />
      <Features />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
