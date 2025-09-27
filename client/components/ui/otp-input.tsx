'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 5,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Focus management
  useEffect(() => {
    if (activeIndex < length && inputRefs.current[activeIndex]) {
      inputRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex, length]);

  // Handle completion
  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    const digit = inputValue.replace(/\D/g, '').slice(-1);
    
    const newValue = value.split('');
    newValue[index] = digit;
    
    const updatedValue = newValue.join('').slice(0, length);
    onChange(updatedValue);

    // Move to next input if digit was entered
    if (digit && index < length - 1) {
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      const newValue = value.split('');
      
      if (newValue[index]) {
        // Clear current input
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        setActiveIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      setActiveIndex(index + 1);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const newValue = value.split('');
      newValue[index] = '';
      onChange(newValue.join(''));
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(digits.length, length - 1);
    setActiveIndex(nextIndex);
  };

  const getInputValue = (index: number): string => {
    return value[index] || '';
  };

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={getInputValue(index)}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-12 h-12 text-center text-lg font-semibold',
            'border-2 rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
            // Default state
            'border-gray-300 bg-white text-gray-900',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-white',
            // Focus state
            'focus:border-blue-500 focus:ring-blue-500',
            'dark:focus:border-blue-400 dark:focus:ring-blue-400',
            // Error state
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            error && 'dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400',
            // Active state (has value)
            getInputValue(index) && !error && 'border-blue-500 bg-blue-50',
            getInputValue(index) && !error && 'dark:border-blue-400 dark:bg-blue-900/20'
          )}
        />
      ))}
    </div>
  );
};

interface OTPFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const OTPField: React.FC<OTPFieldProps> = ({
  label,
  error,
  helperText,
  isRequired,
  length = 5,
  value,
  onChange,
  onComplete,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <OTPInput
        length={length}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        disabled={disabled}
        error={!!error}
      />
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{helperText}</p>
      )}
    </div>
  );
};

export default OTPInput;
