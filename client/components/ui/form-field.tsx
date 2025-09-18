'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  showPasswordToggle?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    label, 
    error, 
    helperText, 
    isRequired, 
    showPasswordToggle, 
    className, 
    type,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
              'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500',
              'dark:focus:ring-blue-400 dark:focus:border-blue-400',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              'dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
              showPasswordToggle && 'pr-10',
              className
            )}
            {...props}
          />
          
          {showPasswordToggle && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  options: { value: string; label: string }[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, helperText, isRequired, options, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
            'dark:focus:ring-blue-400 dark:focus:border-blue-400',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, helperText, isRequired, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
            'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500',
            'dark:focus:ring-blue-400 dark:focus:border-blue-400',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';
