"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { formatMoney } from "@/utils/currency";

const Hero = () => {
  const { data: featuredDTOs } = useFeaturedProducts();

  const bandProduct = featuredDTOs?.find(
    (p) => p.slug.includes("band") || p.name.toLowerCase().includes("band")
  ) || {
    name: "Knotted Wrist Band",
    slug: "wollyway-wrist-band-premium",
    price: 14900,
    images: [{ url: "/uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png", isPrimary: true }],
  };

  const keychainProduct = featuredDTOs?.find(
    (p) => p.slug.includes("keychain") || p.name.toLowerCase().includes("keychain")
  ) || {
    name: "Handcrafted Keychain",
    slug: "wollyway-handcrafted-keychain",
    price: 59900,
    images: [{ url: "/uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png", isPrimary: true }],
  };

  const bandImage =
    bandProduct.images?.find((img) => img.isPrimary)?.url ||
    bandProduct.images?.[0]?.url ||
    "/uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png";

  const keychainImage =
    keychainProduct.images?.find((img) => img.isPrimary)?.url ||
    keychainProduct.images?.[0]?.url ||
    "/uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png";

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden hero-background">
      {/* Dynamic Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Large floating orbs */}
        <div
          className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-wolly-mint/30 via-wolly-pink/40 to-transparent filter blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Color accent moved to bottom right */}
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-gradient-to-br from-wolly-pink/60 via-wolly-magenta/40 to-wolly-blush/50 filter blur-3xl glow-effect"></div>
        <div
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-br from-wolly-blush/70 via-wolly-mint/50 to-transparent filter blur-3xl animate-float glow-effect"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Additional floating elements */}
        <div
          className="absolute bottom-32 right-32 w-32 h-32 rounded-full bg-gradient-to-r from-wolly-magenta/40 to-wolly-pink/60 filter blur-2xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-wolly-pink/10 via-transparent to-wolly-magenta/10"></div>
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
              <span className="text-wolly-magenta font-bold">
                Accessories
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
              <span className="text-wolly-magenta font-bold">
                pop culture inspiration</span>. 🌟
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="bg-wolly-magenta hover:bg-wolly-magenta/90 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300">
                <Link href="/shop">
                  Shop Collection <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Image & Hanging Feature Containers */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative w-full h-[30rem] rounded-2xl overflow-visible shadow-2xl">
              <div className="w-full h-full rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Handcrafted accessories"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wolly-magenta/30 to-transparent"></div>
              </div>

              {/* Floating product highlights: Container 1 (Hanging Top-Right) */}
              <Link href={`/product/${bandProduct.slug}`} className="block group">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute top-10 -right-6 glass-card p-4 shadow-xl animate-float cursor-pointer border-2 border-white/60 hover:border-wolly-magenta/60 transition-all z-20 backdrop-blur-md rounded-2xl"
                >
                  <div className="w-28 h-28 rounded-xl overflow-hidden bg-white/80 p-1 shadow-inner">
                    <img
                      src={bandImage}
                      alt={bandProduct.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-2.5">
                    <p className="font-bold text-xs text-foreground truncate max-w-[7.5rem] group-hover:text-wolly-magenta transition-colors">
                      {bandProduct.name}
                    </p>
                    <p className="text-wolly-magenta font-black text-sm mt-0.5">
                      {formatMoney(bandProduct.price)}
                    </p>
                  </div>
                </motion.div>
              </Link>

              {/* Floating product highlights: Container 2 (Hanging Bottom-Left) */}
              <Link href={`/product/${keychainProduct.slug}`} className="block group">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="absolute bottom-16 -left-6 glass-card p-4 shadow-xl animate-float animation-delay-500 cursor-pointer border-2 border-white/60 hover:border-wolly-magenta/60 transition-all z-20 backdrop-blur-md rounded-2xl"
                >
                  <div className="w-28 h-28 rounded-xl overflow-hidden bg-white/80 p-1 shadow-inner">
                    <img
                      src={keychainImage}
                      alt={keychainProduct.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-2.5">
                    <p className="font-bold text-xs text-foreground truncate max-w-[7.5rem] group-hover:text-wolly-magenta transition-colors">
                      {keychainProduct.name}
                    </p>
                    <p className="text-wolly-magenta font-black text-sm mt-0.5">
                      {formatMoney(keychainProduct.price)}
                    </p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;