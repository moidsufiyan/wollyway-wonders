
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Emma Thompson",
    role: "Verified Customer",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "I absolutely love my custom band from Wollyway! The quality is exceptional and it perfectly matches my style. Will definitely be ordering more!",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Verified Customer",
    image: "https://randomuser.me/api/portraits/men/42.jpg",
    quote: "The attention to detail in these handcrafted pieces is amazing. I got a keychain as a gift for my partner and they haven't stopped raving about it!",
    rating: 5
  },
  {
    id: 3,
    name: "Sarah Johnson",
    role: "Verified Customer",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    quote: "Such a unique and beautiful accessory! The colors are vibrant and it's held up perfectly even with daily use. Highly recommend!",
    rating: 4
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

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className="section-container py-20">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-wolly-pink/10 text-wolly-magenta rounded-full text-sm font-medium mb-4">
          Customer Love
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Don't just take our word for it. Hear from our happy customers about their Wollyway experience.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {testimonials.map((testimonial) => (
          <motion.div 
            key={testimonial.id}
            variants={item}
            className="bg-white rounded-2xl p-6 shadow-md border border-wolly-blush/30 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="mb-4">
              <RatingStars rating={testimonial.rating} />
            </div>
            <p className="italic text-gray-700 mb-6">"{testimonial.quote}"</p>
            <div className="flex items-center">
              <img 
                src={testimonial.image} 
                alt={testimonial.name} 
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-medium">{testimonial.name}</h4>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Testimonials;
