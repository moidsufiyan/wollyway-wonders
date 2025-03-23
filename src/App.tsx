
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Index from './pages';
import About from './pages/About';
import Contact from './pages/Contact';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import UserAccount from './pages/UserAccount';
import OrderTracking from './pages/OrderTracking';
import Support from './pages/Support';
import Customize from './pages/Customize';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';
import BundleDetail from "./pages/BundleDetail";
import Bundles from "./pages/Bundles";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/user-account" element={<UserAccount />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/support" element={<Support />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          {/* Bundle Routes */}
          <Route path="/bundles" element={<Bundles />} />
          <Route path="/bundle/:id" element={<BundleDetail />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
