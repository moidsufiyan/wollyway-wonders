import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Compass, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 bg-gradient-to-br from-wolly-blush/20 via-white to-wolly-pink/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-wolly-magenta/10 text-wolly-magenta rounded-full text-sm font-medium mb-6">
                Our Story
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
                Crafting Warmth & Cozy Stories
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Welcome to WollyWay, where every accessory is hand-knitted with care, precision, and high-quality premium yarns.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Brand Mission & Values */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center flex flex-col items-center"
            >
              <div className="bg-wolly-magenta/10 p-4 rounded-full text-wolly-magenta mb-6">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Handcrafted</h3>
              <p className="text-muted-foreground">
                We believe in the beauty of handmade. Every stitch is crafted manually with love and individual attention to detail.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center flex flex-col items-center"
            >
              <div className="bg-wolly-magenta/10 p-4 rounded-full text-wolly-magenta mb-6">
                <Compass size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Creative Expression</h3>
              <p className="text-muted-foreground">
                From vibrant keychains to cozy custom bands, our accessories are designed to speak to your personal style.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center flex flex-col items-center"
            >
              <div className="bg-wolly-magenta/10 p-4 rounded-full text-wolly-magenta mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
              <p className="text-muted-foreground">
                We source only the softest merino wool, organic cotton, and durable hardware locks to ensure lasting quality.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Narrative Context */}
        <section className="py-16 bg-white border-y border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8">Why WollyWay?</h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg text-center">
              <p>
                WollyWay was born out of a passion for knitting and handcrafted design. In a world of fast fashion and mass production, we wanted to create something that feels warm, unique, and deeply personal.
              </p>
              <p>
                Whether it is a custom friendship band for a loved one or a cute cozy keychain to dress up your backpack, each piece represents hours of dedicated craftsmanship. We choose premium color coordinates to make our knitted wares stand out.
              </p>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 text-center max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Have Questions or Custom Request?</h2>
          <p className="text-muted-foreground mb-8">
            We love collaborating on custom orders and unique size fits. Reach out to our design team!
          </p>
          <Button asChild size="lg" className="bg-wolly-magenta hover:bg-wolly-magenta/90 button-hover">
            <Link to="/contact">
              Contact Us <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
