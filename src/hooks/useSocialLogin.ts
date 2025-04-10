
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SocialLoginOptions {
  provider: 'github' | 'facebook';
  redirectUrl?: string;
}

export const useSocialLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const login = async ({ provider, redirectUrl = window.location.href }: SocialLoginOptions) => {
    if (user) {
      toast({
        title: "Already logged in",
        description: "You are already logged in.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // This is a placeholder for actual OAuth implementation
      // In a real implementation, this would redirect to the OAuth provider
      
      switch (provider) {
        case 'github':
          toast({
            title: "GitHub Login",
            description: "GitHub OAuth integration would happen here.",
          });
          break;
        case 'facebook':
          toast({
            title: "Facebook Login",
            description: "Facebook OAuth integration would happen here.",
          });
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
      // Simulate OAuth flow timing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err: any) {
      setError(err.message || 'Failed to login with social provider');
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message || "Failed to login with social provider",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
};
