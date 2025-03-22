
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Search, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // For demo purposes - simulating a cart with items
    setCartCount(3);

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Collections', path: '/collections' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-300",
      isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-wolly-magenta to-wolly-pink bg-clip-text text-transparent">
              Wollyway
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path}
                className="font-medium text-gray-700 hover:text-wolly-magenta transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-wolly-pink after:transition-all hover:after:w-full"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-wolly-pink/10"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} className="text-gray-700" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-wolly-pink/10"
              onClick={() => {/* TODO: Implement auth modal */}}
            >
              <User size={20} className="text-gray-700" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-wolly-pink/10"
              onClick={() => {/* TODO: Implement wishlist */}}
            >
              <Heart size={20} className="text-gray-700" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-wolly-pink/10 relative"
              onClick={() => {/* TODO: Implement cart */}}
            >
              <ShoppingBag size={20} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-wolly-magenta text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} className="text-gray-700" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full relative ml-2"
              onClick={() => {/* TODO: Implement cart */}}
            >
              <ShoppingBag size={20} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-wolly-magenta text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full ml-2" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X size={24} className="text-gray-700" />
              ) : (
                <Menu size={24} className="text-gray-700" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="absolute top-16 md:top-20 left-0 w-full bg-white shadow-md p-4 animate-fade-in">
          <div className="max-w-3xl mx-auto flex items-center">
            <Input 
              type="text" 
              placeholder="Search for products..." 
              className="flex-1"
              autoFocus 
            />
            <Button 
              className="ml-2 bg-wolly-magenta hover:bg-wolly-magenta/90"
              onClick={() => setIsSearchOpen(false)}
            >
              Search
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsSearchOpen(false)} 
              className="ml-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md animate-fade-in">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block py-3 font-medium text-gray-700 hover:text-wolly-magenta transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex justify-around pt-4 border-t border-gray-100">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-wolly-pink/10"
                onClick={() => {/* TODO: Implement auth modal */}}
              >
                <User size={20} className="text-gray-700" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-wolly-pink/10"
                onClick={() => {/* TODO: Implement wishlist */}}
              >
                <Heart size={20} className="text-gray-700" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
