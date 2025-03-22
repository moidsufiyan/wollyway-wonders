
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Search, User, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      setIsAuthDialogOpen(false);
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      console.error('Authentication error:', error);
      // In a real app, you would show an error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
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
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-wolly-pink/10 overflow-hidden">
                    <Avatar>
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-wolly-pink/10"
                  >
                    <User size={20} className="text-gray-700" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {authMode === 'login' ? 'Login to your account' : 'Create an account'}
                    </DialogTitle>
                    <DialogDescription>
                      {authMode === 'login' 
                        ? 'Enter your email and password to access your account' 
                        : 'Fill in the information below to create your account'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAuthSubmit} className="space-y-4 pt-4">
                    {authMode === 'register' && (
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                          id="name" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe" 
                          required 
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                        className="mb-2 sm:mb-0"
                      >
                        {authMode === 'login' ? 'Create account' : 'Back to login'}
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-wolly-magenta hover:bg-wolly-magenta/90">
                        {isSubmitting ? 'Processing...' : authMode === 'login' ? 'Login' : 'Register'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-wolly-pink/10 relative"
              onClick={() => navigate('/wishlist')}
            >
              <Heart size={20} className="text-gray-700" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-wolly-magenta text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-wolly-pink/10 relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag size={20} className="text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-wolly-magenta text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {itemCount}
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
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag size={20} className="text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-wolly-magenta text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
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
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex items-center">
            <Input 
              type="text" 
              placeholder="Search for products..." 
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus 
            />
            <Button 
              type="submit"
              className="ml-2 bg-wolly-magenta hover:bg-wolly-magenta/90"
            >
              Search
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => setIsSearchOpen(false)} 
              className="ml-2"
            >
              Cancel
            </Button>
          </form>
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
              {isAuthenticated ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    navigate('/profile');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center"
                >
                  <User size={18} className="mr-2" />
                  Profile
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setIsAuthDialogOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center"
                >
                  <User size={18} className="mr-2" />
                  Login
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  navigate('/wishlist');
                  setIsMenuOpen(false);
                }}
                className="flex items-center"
              >
                <Heart size={18} className="mr-2" />
                Wishlist
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
