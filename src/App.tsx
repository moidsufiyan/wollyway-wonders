
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import OrderTracking from "./pages/OrderTracking";
import AdminDashboard from "./pages/AdminDashboard";
import UserAccount from "./pages/UserAccount";
import Login from "./pages/Login";
import Customize from "./pages/Customize";
import Support from "./pages/Support";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  
                  {/* New routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/account" element={<UserAccount />} />
                  <Route path="/track-order" element={<OrderTracking />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/customize" element={<Customize />} />
                  <Route path="/support" element={<Support />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
