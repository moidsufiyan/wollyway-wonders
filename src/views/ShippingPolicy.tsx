"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const ShippingPolicy = () => {
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
            Shipping
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Shipping & Delivery</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: July 9, 2026</p>

          <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Thank you for supporting WollyWay's handcrafted items! Because each piece is handmade, our shipping policies reflect the time it takes to carefully stitch, pack, and ship your cozy accessories.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">1. Processing Times</h2>
            <p>
              Standard orders are typically processed and prepared for shipping within 2 to 3 business days. Custom knit or custom sizing requests may take 5 to 7 business days to prepare before shipment.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">2. Shipping Rates & Delivery Estimates</h2>
            <p>
              Shipping charges for your order will be calculated and displayed at checkout. Standard shipping typically takes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Domestic Shipping</strong>: 3 to 5 business days.</li>
              <li><strong>Express Delivery</strong>: 1 to 2 business days.</li>
              <li><strong>International Shipping</strong>: 7 to 14 business days depending on location.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">3. Shipment Confirmation & Tracking</h2>
            <p>
              You will receive a Shipment Confirmation email containing your tracking number(s) once your order has shipped. The tracking number will be active within 24 hours. You can track your package directly on our <a href="/order-tracking" className="text-wolly-magenta hover:underline">Order Tracking</a> page.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">4. Customs, Duties, and Taxes</h2>
            <p>
              WollyWay is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingPolicy;
