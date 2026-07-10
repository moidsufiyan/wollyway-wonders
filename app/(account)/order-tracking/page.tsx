import React, { Suspense } from "react";
import OrderTracking from "@/views/OrderTracking";

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse">Loading order tracking...</div>}>
      <OrderTracking />
    </Suspense>
  );
}
