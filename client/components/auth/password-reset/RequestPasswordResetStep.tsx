'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';

import { AuthService } from '@/lib/api/services/authService';
import { requestPasswordResetSchema, RequestPasswordResetFormData } from '@/lib/validation/auth-schemas';

interface RequestPasswordResetStepProps {
  onComplete: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function RequestPasswordResetStep({ onComplete, isLoading, setIsLoading }: RequestPasswordResetStepProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema),
    mode: 'onChange',
  });

  const email = watch('email');

  const onSubmit = async (data: RequestPasswordResetFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.requestPasswordReset(data);
      
      toast.success('If an account exists with this email, you will receive a password reset email shortly.');
      
      // Pass the email to the next step
      onComplete({
        email: data.email,
      });
      
    } catch (err: any) {
      
      // Note: For security, the API always returns success message
      // But we handle errors gracefully
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          'Failed to send reset email. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Enter your email address and we'll send you a verification code to reset your password.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
          disabled={isLoading}
          autoComplete="email"
          autoFocus
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !email}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Reset Code...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Send Reset Code
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          We'll send a 6-digit verification code to your email address if an account exists.
        </p>
      </div>
    </form>
  );
}
