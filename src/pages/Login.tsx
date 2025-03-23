
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Github, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, register, isAuthenticated } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get redirect URL from query parameters or default to home
  const from = new URLSearchParams(location.search).get('from') || '/';
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from);
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      toast({
        title: "Login successful",
        description: "Welcome back to Wollyway!",
      });
      navigate(from);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await register(registerName, registerEmail, registerPassword);
      toast({
        title: "Registration successful",
        description: "Welcome to Wollyway!",
      });
      navigate(from);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Please check your information and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to Wollyway</h1>
            <p className="text-muted-foreground">
              Sign in to your account or create a new one
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link 
                        to="/reset-password" 
                        className="text-xs text-wolly-magenta hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-wolly-magenta hover:bg-wolly-magenta/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="w-full">
                      <Github className="mr-2 h-4 w-4" />
                      Github
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                      Facebook
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-wolly-magenta hover:bg-wolly-magenta/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    By creating an account, you agree to our{' '}
                    <Link to="/terms" className="text-wolly-magenta hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-wolly-magenta hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Want to explore first?{' '}
              <Button 
                asChild
                variant="link" 
                className="p-0 h-auto text-wolly-magenta hover:text-wolly-magenta/90"
              >
                <Link to="/shop" className="inline-flex items-center">
                  Continue as guest
                  <ArrowRight size={14} className="ml-1" />
                </Link>
              </Button>
            </p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
