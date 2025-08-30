import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProductDataService from "@/services/ProductDataService";

// Get featured products from our data service
const featuredProducts = ProductDataService.allProducts
  .filter((p) => p.isFeatured || p.isNew)
  .slice(0, 3);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const ProductCard = ({
  product,
}: {
  product: (typeof ProductDataService.allProducts)[0];
}) => {
  return (
    <motion.div
      variants={item}
      className="group"
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <div className="gradient-card rounded-3xl p-6 glow-effect hover:shadow-wolly-pink/40 transition-all duration-500 border-4 border-wolly-pink/40 hover:border-wolly-magenta/60">
        <div className="product-image-container aspect-square mb-6 rounded-2xl overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="product-image w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Link to={`/product/${product.id}`}>
                <Button className="bg-white hover:bg-white/90 text-wolly-magenta rounded-full shadow-md button-hover">
                  View Product
                </Button>
              </Link>
            </div>
          </div>
          {product.isNew && (
                          <span className="absolute top-4 left-4 bg-gradient-to-r from-wolly-magenta to-wolly-pink text-white text-sm font-black px-4 py-2 rounded-full shadow-lg">
                ✨ NEW ✨
              </span>
          )}
        </div>
        <div className="text-center">
          <span className="text-sm uppercase text-wolly-magenta/70 tracking-wider font-bold">
            {product.category}
          </span>
                      <h3 className="font-black text-xl mt-2 text-foreground group-hover:text-wolly-magenta transition-all duration-300">
              {product.name}
            </h3>
            <p className="font-black text-2xl text-wolly-magenta mt-2">
              ₹{product.price.toFixed(2)}
            </p>

          {/* Add to cart button */}
          <motion.div
            className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button className="bg-wolly-magenta hover:bg-wolly-magenta/90 text-white font-bold text-sm px-6 py-2 rounded-2xl transition-all duration-300">
              Add to Cart 🛒
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturedProducts = () => {
  return (
    <section className="section-container py-20 section-gradient relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-20 w-72 h-72 rounded-full bg-gradient-to-br from-wolly-pink/30 to-transparent filter blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-wolly-blush/40 to-transparent filter blur-3xl"></div>
      </div>

      <div className="text-center mb-16">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="inline-block px-8 py-4 bg-gradient-to-r from-wolly-magenta/30 via-wolly-pink/40 to-wolly-blush/30 
                     text-wolly-magenta border-2 border-wolly-pink/60 rounded-full text-lg font-bold mb-6 
                     shadow-2xl shadow-wolly-pink/30 glow-effect"
        >
          🔥 Featured Collection 🔥
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-black mb-6 text-wolly-magenta"
        >
          Our Hand-Knitted Favorites
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl font-semibold text-wolly-purple/80 max-w-3xl mx-auto"
        >
          ✨ Discover our most loved hand-knitted pieces. Each item is{" "}
              <span className="text-wolly-magenta font-bold">carefully crafted</span>{" "}
          with premium yarn and attention to detail! ✨
        </motion.p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>

      <div className="mt-16 text-center">
        <Button
          asChild
          size="lg"
          className="bg-wolly-magenta hover:bg-wolly-magenta/90 text-white button-hover"
        >
          <Link to="/shop">
            View All Knitted Products <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default FeaturedProducts;
