import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Collections from "@/components/Collections";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { motion, useScroll, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen gradient-bg">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
        style={{ scaleX }}
      >
        <div className="h-full bg-gradient-to-r from-wolly-magenta via-wolly-pink to-wolly-blush" />
      </motion.div>

      <Navbar />
      <Hero />

      {/* Search Section */}
      <section className="py-12 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Find Your Perfect Accessory
            </h2>
            <p className="text-muted-foreground mb-8">
              Explore our collection of handcrafted accessories designed to
              express your unique style
            </p>

            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by name, category, or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                className="bg-wolly-magenta hover:bg-wolly-magenta/90"
              >
                <Search size={18} className="mr-2" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      <FeaturedProducts />
      <Collections />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
