
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SearchBar from './SearchBar';

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors duration-300 ${
        isActive ? 'text-wolly-magenta' : 'text-foreground hover:text-wolly-magenta'
      }`}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { items } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`w-full fixed top-0 z-50 transition-colors duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-sm border-b' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-bold text-xl text-gradient">WollyWay</span>
          </Link>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:block mx-4 flex-1 max-w-md">
            <SearchBar />
          </div>
          
          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/bundles">Bundles</NavLink>
            <NavLink to="/customize">Customize</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center">
            {/* Cart */}
            <Link to="/cart" className="relative mr-4">
              <ShoppingCart className="h-5 w-5 text-foreground hover:text-wolly-magenta transition-colors duration-300" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-wolly-magenta text-white text-xs rounded-full px-1.5 py-0.5">
                  {items.length}
                </span>
              )}
            </Link>
            
            {/* Auth Links */}
            {isAuthenticated ? (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar || "https://avatars.dicebear.com/api/open-peeps/example.svg"} />
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu shadow bg-base-100 rounded-box w-52">
                  <li><Link to="/profile">Profile</Link></li>
                  <li><Link to="/user-account">Account Settings</Link></li>
                  <li><button onClick={logout}>Logout</button></li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-foreground hover:text-wolly-magenta transition-colors duration-300">
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile Menu */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
          
          {/* Mobile Menu Panel */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="fixed top-0 left-0 w-screen h-screen bg-background/95 backdrop-blur-sm z-50 flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-end p-4">
                  <button onClick={closeMenu}>
                    <X className="h-6 w-6 text-foreground" />
                  </button>
                </div>
                
                {/* Search Bar - Mobile */}
                <div className="px-8 mb-4">
                  <SearchBar />
                </div>
                
                <nav className="flex flex-col space-y-4 text-lg p-8">
                  <Link to="/" onClick={closeMenu}>Home</Link>
                  <Link to="/shop" onClick={closeMenu}>Shop</Link>
                  <Link to="/bundles" onClick={closeMenu}>Bundles</Link>
                  <Link to="/customize" onClick={closeMenu}>Customize</Link>
                  <Link to="/about" onClick={closeMenu}>About</Link>
                  <Link to="/contact" onClick={closeMenu}>Contact</Link>
                </nav>
                
                <div className="mt-auto p-8 border-t">
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-2">
                      <Link to="/profile" onClick={closeMenu}>Profile</Link>
                      <Link to="/user-account" onClick={closeMenu}>Account Settings</Link>
                      <button onClick={() => { logout(); closeMenu(); }}>Logout</button>
                    </div>
                  ) : (
                    <Link to="/login" onClick={closeMenu} className="text-wolly-magenta">
                      Login
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
