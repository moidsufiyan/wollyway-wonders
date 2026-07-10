import React, { Suspense } from "react";
import Login from "@/views/Login";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse">Loading login...</div>}>
      <Login />
    </Suspense>
  );
}
