import React, { Suspense } from "react";
import Shop from "@/views/Shop";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse">Loading shop...</div>}>
      <Shop />
    </Suspense>
  );
}
