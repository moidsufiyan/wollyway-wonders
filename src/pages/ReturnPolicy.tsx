import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const ReturnPolicy = () => {
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
            Returns
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Returns & Refund Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: July 9, 2026</p>

          <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>
              We want you to love your WollyWay knitted accessories! If you are not completely satisfied with your purchase, we are here to help.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">1. Return Window</h2>
            <p>
              You have 30 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">2. Non-Returnable Items</h2>
            <p>
              Please note that certain items cannot be returned:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Customized or engraved products (made-to-order sizing).</li>
              <li>Products purchased on clearance/sale.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">3. Refunds</h2>
            <p>
              Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item. If your return is approved, we will initiate a refund to your credit card (or original method of payment) within 5 to 7 business days.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">4. Return Shipping</h2>
            <p>
              You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnPolicy;
