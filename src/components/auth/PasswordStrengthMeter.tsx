
import React, { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: 'Too weak', color: 'bg-gray-200' };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
    
    // Determine label and color based on score
    let label, color;
    switch (score) {
      case 0:
      case 1:
        label = 'Too weak';
        color = 'bg-red-500';
        break;
      case 2:
        label = 'Weak';
        color = 'bg-orange-500';
        break;
      case 3:
        label = 'Fair';
        color = 'bg-yellow-500';
        break;
      case 4:
        label = 'Good';
        color = 'bg-green-500';
        break;
      case 5:
        label = 'Strong';
        color = 'bg-green-600';
        break;
      default:
        label = 'Too weak';
        color = 'bg-red-500';
    }
    
    return { score, label, color };
  }, [password]);
  
  const strengthPercentage = (strength.score / 5) * 100;
  
  return (
    <div className="space-y-1 mt-1">
      <div className="flex justify-between items-center text-xs">
        <span>Password strength:</span>
        <span className={`font-medium ${
          strength.score <= 1 ? 'text-red-500' : 
          strength.score === 2 ? 'text-orange-500' : 
          strength.score === 3 ? 'text-yellow-500' : 
          'text-green-600'
        }`}>
          {strength.label}
        </span>
      </div>
      <Progress 
        value={strengthPercentage} 
        className={cn("h-1", strength.color)} 
      />
      
      <ul className="text-xs text-muted-foreground mt-2 space-y-1">
        <li className={`flex items-center ${password.length >= 8 ? 'text-green-600' : ''}`}>
          {password.length >= 8 ? '✓' : '•'} At least 8 characters
        </li>
        <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
          {/[A-Z]/.test(password) ? '✓' : '•'} One uppercase letter
        </li>
        <li className={`flex items-center ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
          {/[0-9]/.test(password) ? '✓' : '•'} One number
        </li>
        <li className={`flex items-center ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}`}>
          {/[^A-Za-z0-9]/.test(password) ? '✓' : '•'} One special character
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;
