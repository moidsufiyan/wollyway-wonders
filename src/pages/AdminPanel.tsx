
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShoppingBag, 
  Users, 
  CreditCard, 
  Percent, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Placeholder admin data - in a real app this would come from your backend
const adminUser = {
  name: "Admin User",
  email: "admin@example.com",
  role: "Administrator",
  avatar: "https://i.pravatar.cc/150?img=68"
};

// Sample product data
const products = [
  { id: 1, name: "Super Hero Keychain", price: 19.99, stock: 15, category: "Keychains", status: "active" },
  { id: 2, name: "Friendship Bracelets Set", price: 24.99, stock: 10, category: "Bracelets", status: "active" },
  { id: 3, name: "Batman Inspired Band", price: 22.99, stock: 8, category: "Bands", status: "active" },
  { id: 4, name: "Custom Engraved Keychain", price: 29.99, stock: 0, category: "Keychains", status: "out_of_stock" }
];

// Sample orders data
const orders = [
  { 
    id: "ORD-1001", 
    customer: "John Doe", 
    date: "2023-04-10", 
    amount: 44.98, 
    status: "delivered", 
    items: 2 
  },
  { 
    id: "ORD-1002", 
    customer: "Jane Smith", 
    date: "2023-04-09", 
    amount: 22.99, 
    status: "shipped", 
    items: 1 
  },
  { 
    id: "ORD-1003", 
    customer: "Robert Johnson", 
    date: "2023-04-08", 
    amount: 67.97, 
    status: "processing", 
    items: 3 
  },
  { 
    id: "ORD-1004", 
    customer: "Emily Davis", 
    date: "2023-04-07", 
    amount: 19.99, 
    status: "cancelled", 
    items: 1 
  }
];

// Sample discount codes
const discountCodes = [
  { id: 1, code: "SUMMER20", discount: 20, type: "percentage", status: "active", expires: "2023-08-31" },
  { id: 2, code: "WELCOME10", discount: 10, type: "percentage", status: "active", expires: "2023-12-31" },
  { id: 3, code: "SHIPFREE", discount: 5.99, type: "fixed", status: "active", expires: "2023-06-30" }
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple demo login - in a real app you would validate against your backend
    if (email === 'admin@example.com' && password === 'adminpassword') {
      setIsAuthenticated(true);
      toast({
        title: "Login successful",
        description: "Welcome back, Admin User!"
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive"
      });
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navbar />
        
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <div className="w-full max-w-md space-y-6 p-8 border border-border rounded-lg shadow-sm">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Admin Login</h1>
              <p className="text-muted-foreground mt-2">
                Access the administrator dashboard
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="admin@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Login
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                <p className="mt-4">For demo, use:</p>
                <p>Email: admin@example.com</p>
                <p>Password: adminpassword</p>
              </div>
            </form>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Admin Sidebar */}
          <div className="lg:w-1/5">
            <div className="bg-card rounded-lg p-4 shadow-sm border border-border mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img 
                    src={adminUser.avatar} 
                    alt={adminUser.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{adminUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{adminUser.role}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
            
            <div className="hidden lg:block space-y-1">
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingBag size={18} className="mr-2" />
                Products
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <CreditCard size={18} className="mr-2" />
                Orders
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Users size={18} className="mr-2" />
                Customers
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Percent size={18} className="mr-2" />
                Discounts
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings size={18} className="mr-2" />
                Settings
              </Button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:flex-1">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            
            <Tabs defaultValue="products">
              <TabsList className="mb-6">
                <TabsTrigger value="products">
                  <ShoppingBag size={16} className="mr-2 lg:hidden" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <CreditCard size={16} className="mr-2 lg:hidden" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="discounts">
                  <Percent size={16} className="mr-2 lg:hidden" />
                  Discounts
                </TabsTrigger>
              </TabsList>
              
              {/* Products Tab */}
              <TabsContent value="products">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold">Product Management</h2>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search products..." className="pl-9 w-[200px]" />
                      </div>
                      <Button>
                        <Plus size={16} className="mr-2" />
                        Add Product
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted">
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-right">Price</th>
                            <th className="px-4 py-3 text-right">Stock</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product.id} className="border-t border-border hover:bg-muted/50">
                              <td className="px-4 py-3">{product.id}</td>
                              <td className="px-4 py-3">{product.name}</td>
                              <td className="px-4 py-3 text-right">${product.price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">{product.stock}</td>
                              <td className="px-4 py-3">{product.category}</td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center">
                                  <span 
                                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                      product.status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {product.status === 'active' ? 'Active' : 'Out of Stock'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  <Button size="icon" variant="ghost">
                                    <Edit size={16} />
                                  </Button>
                                  <Button size="icon" variant="ghost">
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Orders Tab */}
              <TabsContent value="orders">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Order Management</h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search orders..." className="pl-9 w-[200px]" />
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted">
                            <th className="px-4 py-3 text-left">Order ID</th>
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="px-4 py-3 text-center">Date</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} className="border-t border-border hover:bg-muted/50">
                              <td className="px-4 py-3 font-medium">{order.id}</td>
                              <td className="px-4 py-3">{order.customer}</td>
                              <td className="px-4 py-3 text-center">{order.date}</td>
                              <td className="px-4 py-3 text-right">${order.amount.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center">
                                  <span 
                                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center">
                                  <Button size="sm" variant="outline">View Details</Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Discounts Tab */}
              <TabsContent value="discounts">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Discount Codes</h2>
                    <Button>
                      <Plus size={16} className="mr-2" />
                      New Discount
                    </Button>
                  </div>
                  
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted">
                            <th className="px-4 py-3 text-left">Code</th>
                            <th className="px-4 py-3 text-right">Discount</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-center">Expires</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {discountCodes.map((discount) => (
                            <tr key={discount.id} className="border-t border-border hover:bg-muted/50">
                              <td className="px-4 py-3 font-medium">{discount.code}</td>
                              <td className="px-4 py-3 text-right">
                                {discount.type === 'percentage' ? `${discount.discount}%` : `$${discount.discount.toFixed(2)}`}
                              </td>
                              <td className="px-4 py-3 capitalize">{discount.type}</td>
                              <td className="px-4 py-3 text-center">{discount.expires}</td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center">
                                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                    Active
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  <Button size="icon" variant="ghost">
                                    <Edit size={16} />
                                  </Button>
                                  <Button size="icon" variant="ghost">
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
