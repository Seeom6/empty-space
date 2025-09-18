'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, CheckCircle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';

import { AuthService } from '@/lib/api/services/authService';
import { completeRegistrationSchema, CompleteRegistrationFormData } from '@/lib/validation/auth-schemas';

interface CompleteRegistrationStepProps {
  registrationData: any;
  onComplete: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function CompleteRegistrationStep({ 
  registrationData, 
  onComplete, 
  isLoading, 
  setIsLoading 
}: CompleteRegistrationStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CompleteRegistrationFormData>({
    resolver: zodResolver(completeRegistrationSchema),
    mode: 'onChange',
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const onSubmit = async (data: CompleteRegistrationFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const requestData = {
        password: data.password,
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
      };

      const response = await AuthService.completeRegistration(requestData);
      
      toast.success('Registration completed successfully!');
      
      // Pass the user data to complete the flow
      onComplete({
        user: response.data.user,
        isComplete: true,
      });
      
    } catch (err: any) {
      
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          'Failed to complete registration. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = password && confirmPassword && password === confirmPassword;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription>
          Email verified! Create a secure password to complete your registration.
        </AlertDescription>
      </Alert>

      {/* Registration Summary */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h3 className="font-medium text-sm">Registration Summary</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Name:</strong> {registrationData.firstName} {registrationData.lastName}</p>
          <p><strong>Email:</strong> {registrationData.email}</p>
          {registrationData.position && (
            <p><strong>Position:</strong> {registrationData.position.name}</p>
          )}
          {registrationData.position?.department && (
            <p><strong>Department:</strong> {registrationData.position.department.name}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a secure password"
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
            disabled={isLoading}
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-0 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-red-500' : ''}
            disabled={isLoading}
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-0 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+1234567890"
          {...register('phoneNumber')}
          className={errors.phoneNumber ? 'border-red-500' : ''}
          disabled={isLoading}
          autoComplete="tel"
        />
        {errors.phoneNumber && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.phoneNumber.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Phone number should be in E.164 format (e.g., +1234567890)
        </p>
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
            Creating Account...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Complete Registration
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          By completing registration, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </form>
  );
}
