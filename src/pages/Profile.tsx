
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, CreditCard, LogOut, Edit2, Settings, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Redirect to home if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
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
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setIsEditingProfile(false);
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
      duration: 3000,
    });
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation don't match.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    
    // Reset password form
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
      duration: 3000,
    });
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
  };
  
  // Mock order history
  const orderHistory = [
    {
      id: 'WW10001',
      date: '2023-05-15',
      status: 'Delivered',
      total: 42.99,
      items: 2
    },
    {
      id: 'WW10002',
      date: '2023-04-22',
      status: 'Delivered',
      total: 67.50,
      items: 3
    }
  ];

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 section-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar / User Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                
                <Separator className="my-4" />
                
                <nav className="space-y-1">
                  {[
                    { icon: <User size={18} />, label: 'My Profile', value: 'profile' },
                    { icon: <Package size={18} />, label: 'Orders', value: 'orders' },
                    { icon: <Heart size={18} />, label: 'Wishlist', value: 'wishlist' },
                    { icon: <CreditCard size={18} />, label: 'Payment Methods', value: 'payment' },
                    { icon: <Shield size={18} />, label: 'Security', value: 'security' },
                    { icon: <Settings size={18} />, label: 'Preferences', value: 'preferences' },
                  ].map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate(`/profile?tab=${item.value}`)}
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
            </motion.div>
            
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <Tabs defaultValue="profile" className="h-full space-y-6">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="orders">Order History</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                
                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <div className="bg-white shadow-sm rounded-xl border border-border overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Personal Information</h2>
                        {!isEditingProfile ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingProfile(true)}
                          >
                            <Edit2 size={16} className="mr-2" />
                            Edit
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingProfile(false)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                      
                      {!isEditingProfile ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                              <p>{profileForm.name}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                              <p>{profileForm.email}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                            <p>{profileForm.phone || 'Not provided'}</p>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                            <p>{profileForm.address || 'Not provided'}</p>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">City</h3>
                              <p>{profileForm.city || 'Not provided'}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">State</h3>
                              <p>{profileForm.state || 'Not provided'}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Zip Code</h3>
                              <p>{profileForm.zipCode || 'Not provided'}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Country</h3>
                            <p>{profileForm.country}</p>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                name="name"
                                value={profileForm.name}
                                onChange={handleProfileChange}
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={profileForm.phone}
                              onChange={handleProfileChange}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              name="address"
                              value={profileForm.address}
                              onChange={handleProfileChange}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                name="city"
                                value={profileForm.city}
                                onChange={handleProfileChange}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                name="state"
                                value={profileForm.state}
                                onChange={handleProfileChange}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="zipCode">Zip Code</Label>
                              <Input
                                id="zipCode"
                                name="zipCode"
                                value={profileForm.zipCode}
                                onChange={handleProfileChange}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              name="country"
                              value={profileForm.country}
                              onChange={handleProfileChange}
                            />
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
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Orders Tab */}
                <TabsContent value="orders">
                  <div className="bg-white shadow-sm rounded-xl border border-border overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-6">Order History</h2>
                      
                      {orderHistory.length === 0 ? (
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
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4">Order ID</th>
                                <th className="text-left py-3 px-4">Date</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Total</th>
                                <th className="text-left py-3 px-4">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderHistory.map(order => (
                                <tr key={order.id} className="border-b hover:bg-gray-50">
                                  <td className="py-3 px-4 font-medium">{order.id}</td>
                                  <td className="py-3 px-4">{order.date}</td>
                                  <td className="py-3 px-4">
                                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">${order.total.toFixed(2)}</td>
                                  <td className="py-3 px-4">
                                    <Button variant="outline" size="sm">
                                      View Details
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Security Tab */}
                <TabsContent value="security">
                  <div className="bg-white shadow-sm rounded-xl border border-border overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-6">Change Password</h2>
                      
                      <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
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
                            Use at least 8 characters with a mix of letters, numbers & symbols.
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
                        
                        <div className="pt-4">
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
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
