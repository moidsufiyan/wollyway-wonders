import React, { Suspense } from "react";
import CheckoutSuccess from "@/views/CheckoutSuccess";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse">Loading order confirmation...</div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}
