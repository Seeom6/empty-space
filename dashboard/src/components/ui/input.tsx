'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Default styling
          'border-gray-300 bg-white text-gray-900 placeholder-gray-400',
          'dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500',
          // Focus styling
          'focus:border-blue-500 focus:ring-blue-500',
          'dark:focus:border-blue-400 dark:focus:ring-blue-400',
          // Disabled styling
          'disabled:bg-gray-50 disabled:text-gray-500',
          'dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
