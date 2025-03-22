
import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  token?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user data from localStorage', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await userService.login(email, password);
      
      const userData = {
        id: data._id,
        _id: data._id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        role: data.role,
        token: data.token,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.name}!`,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await userService.register(name, email, password);
      
      const userData = {
        id: data._id,
        _id: data._id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        role: data.role,
        token: data.token,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.name}!`,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Could not create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      const data = await userService.updateProfile(userData);
      
      const updatedUserData = {
        ...user,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        token: data.token || user?.token,
      };
      
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "Could not update profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
