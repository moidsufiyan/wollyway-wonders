
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for joining our newsletter.",
      });
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-wolly-pink/5 to-wolly-blush/20">
      <div className="section-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="inline-block px-4 py-1.5 bg-wolly-pink/20 text-wolly-magenta rounded-full text-sm font-medium mb-4">
            Stay Connected
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to get updates on new collections, special offers, and exclusive content.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border-wolly-pink/20 focus:border-wolly-pink focus:ring-wolly-pink/30 h-12"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-wolly-magenta hover:bg-wolly-magenta/90 text-white button-hover h-12"
            >
              {isSubmitting ? 'Subscribing...' : (
                <>
                  Subscribe <Send size={16} className="ml-2" />
                </>
              )}
            </Button>
          </form>
          
          <p className="text-sm text-muted-foreground mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
