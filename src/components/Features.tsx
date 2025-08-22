
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Palette, Gift, RefreshCw } from 'lucide-react';

const features = [
  {
    id: 1,
    icon: <Sparkles className="h-6 w-6 text-wolly-magenta" />,
    title: "Handcrafted Quality",
    description: "Each piece is carefully created by hand with attention to detail and premium materials for long-lasting quality."
  },
  {
    id: 2,
    icon: <Palette className="h-6 w-6 text-wolly-magenta" />,
    title: "Customizable Designs",
    description: "Express your unique style with our customizable options. Choose colors, patterns, and add personal touches."
  },
  {
    id: 3,
    icon: <Gift className="h-6 w-6 text-wolly-magenta" />,
    title: "Perfect Gifting",
    description: "Our beautifully packaged accessories make the perfect thoughtful gift for any occasion or loved one."
  },
  {
    id: 4,
    icon: <RefreshCw className="h-6 w-6 text-wolly-magenta" />,
    title: "Sustainable Practices",
    description: "We're committed to eco-friendly materials and sustainable production methods for a better planet."
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

const Features = () => {
  return (
    <section className="section-container py-24 section-gradient relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-10 w-80 h-80 rounded-full bg-gradient-to-br from-wolly-mint/20 to-transparent filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-10 w-72 h-72 rounded-full bg-gradient-to-br from-wolly-blush/30 to-transparent filter blur-3xl animate-pulse"></div>
      </div>
      
      {/* Section header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-black text-gradient-bold mb-4">
          Why Choose WollyWay? 🌟
        </h2>
        <p className="text-xl font-semibold text-wolly-purple/80 max-w-2xl mx-auto">
          Experience the difference with our <span className="text-gradient font-bold">premium handcrafted</span> accessories!
        </p>
      </motion.div>
      
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {features.map((feature) => (
          <motion.div 
            key={feature.id}
            variants={item}
            whileHover={{ y: -15, rotateY: 5 }}
            className="gradient-card rounded-3xl p-8 glow-effect hover:shadow-2xl hover:shadow-wolly-pink/30 
                       transition-all duration-500 hover:scale-105 group border-2 border-wolly-pink/50 
                       hover:border-wolly-magenta/70 cursor-pointer"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-wolly-magenta/30 via-wolly-pink/40 to-wolly-blush/20 
                            rounded-2xl mb-6 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500 
                            shadow-lg shadow-wolly-pink/20 glow-effect">
              {feature.icon}
            </div>
            <h3 className="text-xl font-black mb-3 text-wolly-purple group-hover:text-gradient transition-all duration-300">
              {feature.title}
            </h3>
            <p className="text-wolly-purple/70 font-medium leading-relaxed">{feature.description}</p>
            
            {/* Decorative element */}
            <div className="mt-4 w-full h-1 bg-gradient-to-r from-transparent via-wolly-pink/50 to-transparent rounded-full 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Features;
