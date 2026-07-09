import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-border p-8 md:p-12 shadow-sm my-10"
        >
          <span className="inline-block px-3 py-1 bg-wolly-magenta/10 text-wolly-magenta rounded-full text-xs font-semibold mb-4">
            Legal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: July 9, 2026</p>

          <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Welcome to WollyWay. By accessing or using our website, you agree to comply with and be bound by the following Terms of Service.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">1. Store Terms</h2>
            <p>
              By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our handcrafted products for any illegal or unauthorized purpose, nor may you violate any laws in your jurisdiction.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">2. Accuracy of Product Details</h2>
            <p>
              Because our products are individually handcrafted, minor variations in stitch count, color shading, and size dimensions may occur naturally. We make every effort to display as accurately as possible the colors and images of our products.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">3. Billing and Account Information</h2>
            <p>
              We reserve the right to refuse any order you place with us. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">4. Pricing and Modifications</h2>
            <p>
              Prices for our accessories are subject to change without notice. We reserve the right at any time to modify or discontinue any product or service without notice.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">5. Governing Law</h2>
            <p>
              These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with local regulations and commercial laws. For any questions, please contact hello@wollyway.com.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
