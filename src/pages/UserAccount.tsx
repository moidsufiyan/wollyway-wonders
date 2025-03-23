
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, MapPin, Package, CreditCard } from 'lucide-react';

const UserAccount = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full">
                      <User size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{user?.name || 'User'}</CardTitle>
                      <CardDescription>{user?.email || 'email@example.com'}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <nav className="flex flex-col space-y-1">
                    <Button 
                      variant="ghost" 
                      className={`justify-start ${activeTab === 'profile' ? 'bg-muted' : ''}`}
                      onClick={() => setActiveTab('profile')}
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`justify-start ${activeTab === 'addresses' ? 'bg-muted' : ''}`}
                      onClick={() => setActiveTab('addresses')}
                    >
                      <MapPin size={16} className="mr-2" />
                      Addresses
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`justify-start ${activeTab === 'orders' ? 'bg-muted' : ''}`}
                      onClick={() => setActiveTab('orders')}
                    >
                      <Package size={16} className="mr-2" />
                      Orders
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`justify-start ${activeTab === 'payment' ? 'bg-muted' : ''}`}
                      onClick={() => setActiveTab('payment')}
                    >
                      <CreditCard size={16} className="mr-2" />
                      Payment Methods
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={logout}
                      className="justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Logout
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" defaultValue={user?.name || ''} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" defaultValue={user?.email || ''} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" defaultValue="+1 (555) 123-4567" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input id="dob" type="date" />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button type="button" className="bg-wolly-magenta hover:bg-wolly-magenta/90">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'addresses' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Addresses</CardTitle>
                    <CardDescription>
                      Manage your shipping addresses.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 relative">
                        <div className="absolute top-2 right-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                        <p className="font-semibold">Home</p>
                        <p>Jane Doe</p>
                        <p>123 Main Street, Apt 4B</p>
                        <p>New York, NY 10001</p>
                        <p>United States</p>
                        <p>Phone: +1 (555) 123-4567</p>
                        <div className="mt-2">
                          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            Default Address
                          </span>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-wolly-magenta hover:bg-wolly-magenta/90">
                        Add New Address
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'orders' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      View and track your orders.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 hover:bg-muted/50 transition cursor-pointer">
                        <div className="flex flex-wrap justify-between mb-2">
                          <div>
                            <p className="font-semibold">Order #1234567</p>
                            <p className="text-sm text-muted-foreground">Placed on May 10, 2023</p>
                          </div>
                          <div>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Delivered
                            </span>
                          </div>
                        </div>
                        <p>Total: $59.96</p>
                        <p className="text-sm">2 items</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 hover:bg-muted/50 transition cursor-pointer">
                        <div className="flex flex-wrap justify-between mb-2">
                          <div>
                            <p className="font-semibold">Order #1234568</p>
                            <p className="text-sm text-muted-foreground">Placed on April 27, 2023</p>
                          </div>
                          <div>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Shipped
                            </span>
                          </div>
                        </div>
                        <p>Total: $128.50</p>
                        <p className="text-sm">4 items</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your saved payment methods.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 relative">
                        <div className="absolute top-2 right-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                        <div className="flex items-center">
                          <div className="bg-slate-100 p-2 rounded mr-3">
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <p className="font-semibold">Visa ending in 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/25</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-wolly-magenta hover:bg-wolly-magenta/90">
                        Add Payment Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserAccount;
