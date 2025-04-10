
import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook, Github } from 'lucide-react';
import { useSocialLogin } from '@/hooks/useSocialLogin';

interface SocialLoginButtonsProps {
  className?: string;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ className }) => {
  const { login, isLoading } = useSocialLogin();

  const handleGithubLogin = () => {
    login({ provider: 'github' });
  };

  const handleFacebookLogin = () => {
    login({ provider: 'facebook' });
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={handleGithubLogin}
        disabled={isLoading}
      >
        <Github className="mr-2 h-4 w-4" />
        Github
      </Button>
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={handleFacebookLogin}
        disabled={isLoading}
      >
        <Facebook className="mr-2 h-4 w-4 text-blue-600" />
        Facebook
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
