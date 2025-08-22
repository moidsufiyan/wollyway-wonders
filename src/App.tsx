
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
import UserDashboard from './pages/UserDashboard';
import OrderTracking from './pages/OrderTracking';
import Support from './pages/Support';
import Customize from './pages/Customize';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';
import BundleDetail from "./pages/BundleDetail";
import Bundles from "./pages/Bundles";
import FAQ from "./pages/FAQ";
import SizeGuidePage from './pages/SizeGuidePage';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AdminPanel from './pages/AdminPanel';
import MockCheckout from './pages/MockCheckout';
import CheckoutSuccess from './pages/CheckoutSuccess';

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
          <Route path="/checkout" element={<MockCheckout />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/user-account" element={<UserAccount />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/support" element={<Support />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/faq" element={<FAQ />} />
          
          {/* Bundle Routes */}
          <Route path="/bundles" element={<Bundles />} />
          <Route path="/bundle/:id" element={<BundleDetail />} />
          
          {/* Blog Routes */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* Size Guide */}
          <Route path="/size-guide" element={<SizeGuidePage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
