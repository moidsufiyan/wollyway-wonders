import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden hero-background">
      {/* Dynamic Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Large floating orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-gradient-to-br from-wolly-pink/50 via-wolly-magenta/30 to-transparent filter blur-3xl animate-float glow-effect"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-gradient-to-br from-wolly-blush/60 via-wolly-mint/40 to-transparent filter blur-3xl animate-pulse glow-effect"></div>
        <div
          className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-wolly-mint/40 via-wolly-pink/50 to-transparent filter blur-3xl animate-float glow-effect"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Additional floating elements */}
        <div
          className="absolute top-1/3 left-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-wolly-magenta/40 to-wolly-pink/60 filter blur-2xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-wolly-blush/50 to-wolly-mint/30 filter blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-wolly-pink/10 via-transparent to-wolly-magenta/10 animate-pulse"></div>
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                type: "spring",
                bounce: 0.4,
              }}
              className="inline-block px-6 py-3 bg-gradient-to-r from-wolly-magenta/20 via-wolly-pink/30 to-wolly-blush/20 
                         text-wolly-magenta border-2 border-wolly-pink/50 rounded-full text-sm font-bold mb-8 
                         shadow-lg shadow-wolly-pink/20 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              ✨ Handcrafted with Love ✨
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4,
                duration: 1,
                type: "spring",
                bounce: 0.3,
              }}
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-8"
            >
              Uniquely Crafted <br className="hidden md:block" />
              <span className="text-gradient-bold relative">
                Accessories
                <div className="absolute -inset-1 bg-gradient-to-r from-wolly-magenta/20 via-wolly-pink/20 to-wolly-blush/20 blur-xl opacity-75 animate-pulse"></div>
              </span>{" "}
              <br className="hidden md:block" />
              <span className="text-wolly-purple">For Your Style</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl font-semibold text-wolly-purple/80 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              🌟 Discover our{" "}
              <span className="text-wolly-magenta font-bold">
                exclusive collection
              </span>{" "}
              of handmade knotted bands, keychains, and accessories that blend
              craftsmanship with{" "}
              <span className="text-gradient font-bold">
                pop culture inspiration
              </span>
              . 🌟
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="wolly-button">
                <Link to="/shop">
                  Shop Collection <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="wolly-button-outline"
              >
                <Link to="/customize">Customize Your Own</Link>
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
