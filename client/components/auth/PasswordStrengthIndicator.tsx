'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    label: 'Contains uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'Contains lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'Contains number',
    test: (password) => /[0-9]/.test(password),
  },
  {
    label: 'Contains special character',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const metRequirements = requirements.filter(req => req.test(password));
  const strength = metRequirements.length;
  const strengthPercentage = (strength / requirements.length) * 100;

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Password Strength</span>
          <span className={cn(
            "text-sm font-medium",
            strength <= 2 && "text-red-600",
            strength === 3 && "text-yellow-600",
            strength === 4 && "text-blue-600",
            strength === 5 && "text-green-600"
          )}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={strengthPercentage} 
            className="h-2"
          />
          <div 
            className={cn(
              "absolute top-0 left-0 h-2 rounded-full transition-all duration-300",
              getStrengthColor()
            )}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        <span className="text-sm font-medium">Requirements:</span>
        <ul className="space-y-1">
          {requirements.map((requirement, index) => {
            const isMet = requirement.test(password);
            return (
              <li 
                key={index}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors",
                  isMet ? "text-green-600" : "text-muted-foreground"
                )}
              >
                {isMet ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
                {requirement.label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
