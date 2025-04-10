
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Package, Heart, Settings, LogOut, 
  MapPin, ShoppingBag, Clock, Loader2 
} from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductGrid from '@/components/ProductGrid';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddressCard, { Address } from '@/components/user/AddressCard';
import AddressForm from '@/components/user/AddressForm';
import OrderCard from '@/components/user/OrderCard';
import { Order } from '@/types/order';
import { type Product } from '@/pages/Shop';

// Mock data for addresses
const initialAddresses: Address[] = [
  {
    id: '1',
    street: '123 Main Street, Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    isDefault: true,
  },
  {
    id: '2',
    street: '456 Oak Avenue',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    country: 'United States',
    isDefault: false,
  },
];

// Mock data for orders
const initialOrders: Order[] = [
  {
    id: '1',
    userId: '123',
    orderNumber: 'WW10001',
    items: [
      {
        id: '101',
        productId: 'p1',
        name: 'Wolly Pink Band',
        image: 'https://i.pravatar.cc/150?img=1',
        price: 19.99,
        quantity: 2,
        color: 'Pink',
      },
      {
        id: '102',
        productId: 'p2',
        name: 'Wolly Blue Keychain',
        image: 'https://i.pravatar.cc/150?img=2',
        price: 9.99,
        quantity: 1,
      }
    ],
    shippingAddress: {
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
    },
    paymentMethod: 'Credit Card',
    itemsPrice: 49.97,
    shippingPrice: 5.99,
    taxPrice: 4.50,
    totalPrice: 60.46,
    status: 'delivered',
    isPaid: true,
    paidAt: '2023-05-15T12:00:00Z',
    isDelivered: true,
    deliveredAt: '2023-05-18T14:30:00Z',
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-18T14:30:00Z',
  },
  {
    id: '2',
    userId: '123',
    orderNumber: 'WW10002',
    items: [
      {
        id: '201',
        productId: 'p3',
        name: 'Wolly Custom Gift Set',
        image: 'https://i.pravatar.cc/150?img=3',
        price: 49.99,
        quantity: 1,
      }
    ],
    shippingAddress: {
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
    },
    paymentMethod: 'PayPal',
    itemsPrice: 49.99,
    shippingPrice: 5.99,
    taxPrice: 4.50,
    totalPrice: 60.48,
    status: 'shipped',
    isPaid: true,
    paidAt: '2023-06-10T09:15:00Z',
    isDelivered: false,
    createdAt: '2023-06-10T08:45:00Z',
    updatedAt: '2023-06-11T10:20:00Z',
  },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { wishlist, removeItem: removeWishlistItem } = useWishlist();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  
  // State for addresses
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | undefined>(undefined);
  
  // State for orders
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  
  // State for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?from=/user-dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        avatar: profileForm.avatar,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation must match",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed",
      });
      
      // Reset password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your password",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeWishlistItem(productId);
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const openAddressForm = (address?: Address) => {
    setCurrentAddress(address);
    setIsAddressFormOpen(true);
  };

  const closeAddressForm = () => {
    setCurrentAddress(undefined);
    setIsAddressFormOpen(false);
  };

  const handleSaveAddress = (addressData: Omit<Address, 'id'>) => {
    if (currentAddress) {
      // Update existing address
      setAddresses(addresses.map(addr => 
        addr.id === currentAddress.id ? { ...addressData, id: currentAddress.id } : addr
      ));
      
      // If setting a new default, update other addresses
      if (addressData.isDefault) {
        setAddresses(prev => prev.map(addr => 
          addr.id !== currentAddress.id ? { ...addr, isDefault: false } : addr
        ));
      }
      
      toast({
        title: "Address updated",
        description: "Your address has been successfully updated",
      });
    } else {
      // Add new address with a generated ID
      const newAddress = { ...addressData, id: Date.now().toString() };
      
      // If setting as default, update other addresses
      if (newAddress.isDefault) {
        setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
      }
      
      setAddresses([...addresses, newAddress]);
      
      toast({
        title: "Address added",
        description: "Your new address has been added successfully",
      });
    }
    
    closeAddressForm();
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
    
    toast({
      title: "Address removed",
      description: "Your address has been successfully removed",
    });
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };
  
  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/order-tracking?id=${orderId}`);
  };

  // Loading state
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">My Account</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                
                <hr className="my-4" />
                
                <nav className="space-y-1">
                  {[
                    { icon: <User size={18} />, label: 'Account Overview', value: 'overview' },
                    { icon: <Package size={18} />, label: 'Orders', value: 'orders' },
                    { icon: <Heart size={18} />, label: 'Wishlist', value: 'wishlist' },
                    { icon: <MapPin size={18} />, label: 'Addresses', value: 'addresses' },
                    { icon: <Settings size={18} />, label: 'Settings', value: 'settings' },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      variant="ghost"
                      className={`w-full justify-start ${activeTab === item.value ? 'bg-muted' : ''}`}
                      onClick={() => setActiveTab(item.value)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Button>
                  ))}
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span className="ml-3">Sign Out</span>
                  </Button>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-white shadow-sm rounded-xl border border-border overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-4">Account Overview</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-3">
                            <ShoppingBag size={18} className="text-wolly-magenta mr-2" />
                            <h3 className="font-medium">Recent Orders</h3>
                          </div>
                          
                          {orders.length > 0 ? (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                You have {orders.length} recent orders
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setActiveTab('orders')}
                              >
                                View Orders
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No recent orders
                            </p>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-3">
                            <Heart size={18} className="text-wolly-magenta mr-2" />
                            <h3 className="font-medium">Wishlist</h3>
                          </div>
                          
                          {wishlist.length > 0 ? (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                You have {wishlist.length} items in your wishlist
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setActiveTab('wishlist')}
                              >
                                View Wishlist
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Your wishlist is empty
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium mb-3">Account Details</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Name</p>
                              <p>{user.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p>{user.email}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setActiveTab('settings')}
                            >
                              Update Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-white shadow-sm rounded-xl border border-border overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Order History</h2>
                    
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin h-8 w-8 text-wolly-magenta" />
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map(order => (
                          <OrderCard 
                            key={order.id} 
                            order={order} 
                            onViewDetails={handleViewOrderDetails} 
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Package size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-4">
                          When you place your first order, it will appear here.
                        </p>
                        <Button
                          className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                          onClick={() => navigate('/shop')}
                        >
                          Start Shopping
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="bg-white shadow-sm rounded-xl border border-border overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">My Wishlist</h2>
                    
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin h-8 w-8 text-wolly-magenta" />
                      </div>
                    ) : wishlist.length > 0 ? (
                      <ProductGrid 
                        products={wishlist} 
                        onAddToCart={handleAddToCart} 
                        onRemoveFromWishlist={handleRemoveFromWishlist}
                        showRemoveButton={true}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <Heart size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                        <p className="text-muted-foreground mb-4">
                          Save items you love to your wishlist by clicking the heart icon.
                        </p>
                        <Button
                          className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                          onClick={() => navigate('/shop')}
                        >
                          Browse Products
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="bg-white shadow-sm rounded-xl border border-border overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Saved Addresses</h2>
                      <Button 
                        className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                        onClick={() => openAddressForm()}
                      >
                        Add New Address
                      </Button>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin h-8 w-8 text-wolly-magenta" />
                      </div>
                    ) : addresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map(address => (
                          <AddressCard
                            key={address.id}
                            address={address}
                            onEdit={openAddressForm}
                            onDelete={handleDeleteAddress}
                            onSetDefault={handleSetDefaultAddress}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No addresses yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Add your first shipping address to speed up checkout.
                        </p>
                        <Button
                          className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                          onClick={() => openAddressForm()}
                        >
                          Add New Address
                        </Button>
                      </div>
                    )}
                    
                    {/* Address Form Dialog */}
                    <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {currentAddress ? 'Edit Address' : 'Add New Address'}
                          </DialogTitle>
                        </DialogHeader>
                        <AddressForm
                          onSubmit={handleSaveAddress}
                          onCancel={closeAddressForm}
                          initialData={currentAddress}
                          isSubmitting={isSaving}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Profile Settings */}
                  <div className="bg-white shadow-sm rounded-xl border border-border overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
                      
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={profileForm.name}
                              onChange={handleProfileChange}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={profileForm.email}
                              onChange={handleProfileChange}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="avatar">Avatar URL</Label>
                            <Input
                              id="avatar"
                              name="avatar"
                              value={profileForm.avatar}
                              onChange={handleProfileChange}
                              placeholder="https://example.com/avatar.jpg"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                          <Button
                            type="submit"
                            className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                  
                  {/* Security Settings */}
                  <div className="bg-white shadow-sm rounded-xl border border-border overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-6">Security Settings</h2>
                      
                      <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                          <Button
                            type="submit"
                            className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Updating...' : 'Update Password'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
