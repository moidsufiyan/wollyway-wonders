"use client";

import { AuthGuard } from '@/components/auth/AuthGuard';
import Checkout from '@/views/Checkout';

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Checkout />
    </AuthGuard>
  );
}
