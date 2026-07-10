"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: July 9, 2026</p>

          <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>
              At WollyWay, we value and respect your privacy. This Privacy Policy describes how we collect, use, and share information when you visit or make a purchase from our site.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">1. Information We Collect</h2>
            <p>
              When you make a purchase or attempt to make a purchase through the site, we collect certain information from you, including your name, billing address, shipping address, email address, and phone number. We refer to this information as "Order Information."
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">2. How We Use Your Information</h2>
            <p>
              We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this information to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Communicate with you regarding order statuses.</li>
              <li>Screen our orders for potential risk or fraud.</li>
              <li>Provide you with information or advertising relating to our products or services, when in line with the preferences you have shared with us.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">3. Data Retention</h2>
            <p>
              When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">4. Security of Your Data</h2>
            <p>
              The security of your personal information is important to us. We implement industry-standard security measures (such as local storage encryption and secure transport layers) to protect the personal data submitted to us.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">5. Updates and Contact</h2>
            <p>
              We may update this privacy policy from time to time in order to reflect changes to our practices or for other operational, legal, or regulatory reasons. For more information about our privacy practices, please contact us via hello@wollyway.com.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
