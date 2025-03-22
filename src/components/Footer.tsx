
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-wolly-blush/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold bg-gradient-to-r from-wolly-magenta to-wolly-pink bg-clip-text text-transparent">
                Wollyway
              </span>
            </Link>
            <p className="text-muted-foreground">
              Handcrafted accessories that blend style, quality, and creativity for your unique expression.
            </p>
            <div className="flex space-x-3">
              <Button size="icon" variant="ghost" className="rounded-full hover:bg-wolly-pink/10 text-gray-600">
                <Instagram size={20} />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full hover:bg-wolly-pink/10 text-gray-600">
                <Facebook size={20} />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full hover:bg-wolly-pink/10 text-gray-600">
                <Twitter size={20} />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Shop', 'Collections', 'About', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-wolly-magenta transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {[
                'FAQ', 
                'Shipping & Returns', 
                'Track Order', 
                'Privacy Policy', 
                'Terms & Conditions'
              ].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-muted-foreground hover:text-wolly-magenta transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-wolly-magenta mr-3 mt-0.5" />
                <span className="text-muted-foreground">
                  123 Craft Street, Artisan City, AC 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-wolly-magenta mr-3" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-wolly-magenta mr-3" />
                <span className="text-muted-foreground">hello@wollyway.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-wolly-blush/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Wollyway. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <img src="https://cdn-icons-png.flaticon.com/128/349/349230.png" alt="Visa" className="h-8 w-auto opacity-70" />
            <img src="https://cdn-icons-png.flaticon.com/128/349/349228.png" alt="Mastercard" className="h-8 w-auto opacity-70" />
            <img src="https://cdn-icons-png.flaticon.com/128/349/349221.png" alt="PayPal" className="h-8 w-auto opacity-70" />
            <img src="https://cdn-icons-png.flaticon.com/128/349/349247.png" alt="American Express" className="h-8 w-auto opacity-70" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
