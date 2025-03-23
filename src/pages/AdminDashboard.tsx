
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, BarChart, PieChart } from 'recharts';
import { Package, Users, DollarSign, ShoppingBag, Star, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Mock data for charts
  const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
  ];
  
  const categoryData = [
    { name: 'Hand Bands', value: 400 },
    { name: 'Keychains', value: 300 },
    { name: 'Custom Knots', value: 300 },
    { name: 'Other', value: 200 },
  ];

  // Redirect if not admin
  React.useEffect(() => {
    // For demo purposes, you might want to check a specific user role
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">+180.1% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">+12 new products</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">+201 this week</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="products" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>
                  Add, edit, and manage your products inventory.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-muted-foreground">
                  Product management interface will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>
                  View and manage customer orders.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-muted-foreground">
                  Order management interface will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>
                  View and manage your customers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-muted-foreground">
                  Customer management interface will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
                <CardDescription>
                  Manage customer reviews and ratings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-muted-foreground">
                  Reviews management interface will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
