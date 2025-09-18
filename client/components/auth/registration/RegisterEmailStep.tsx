'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';

import { AuthService } from '@/lib/api/services/authService';
import { registerEmailSchema, RegisterEmailFormData } from '@/lib/validation/auth-schemas';

interface RegisterEmailStepProps {
  inviteCode: string;
  onComplete: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function RegisterEmailStep({ inviteCode, onComplete, isLoading, setIsLoading }: RegisterEmailStepProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterEmailFormData>({
    resolver: zodResolver(registerEmailSchema),
    mode: 'onChange',
  });

  const formData = watch();

  const onSubmit = async (data: RegisterEmailFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.registerEmail(data);
      
      toast.success('OTP sent to your email address!');
      
      // Pass the email data to the next step
      onComplete({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
    } catch (err: any) {
      
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          'Failed to register email. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email && formData.firstName && formData.lastName;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription>
          Invite code validated! Please provide your personal information to continue.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            {...register('firstName')}
            className={errors.firstName ? 'border-red-500' : ''}
            disabled={isLoading}
            autoComplete="given-name"
            autoFocus
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            {...register('lastName')}
            className={errors.lastName ? 'border-red-500' : ''}
            disabled={isLoading}
            autoComplete="family-name"
          />
          {errors.lastName && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@company.com"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
          disabled={isLoading}
          autoComplete="email"
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
        disabled={isLoading || !isFormValid}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending OTP...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Send Verification Code
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          We'll send a 6-digit verification code to your email address.
        </p>
      </div>
    </form>
  );
}
