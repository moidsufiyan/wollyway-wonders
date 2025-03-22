
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
    <section className="section-container py-20">
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
            className="bg-white rounded-2xl p-6 shadow-sm border border-wolly-blush/30 hover:shadow-md transition-shadow duration-300 hover:border-wolly-pink/30"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-wolly-pink/10 rounded-xl mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Features;
