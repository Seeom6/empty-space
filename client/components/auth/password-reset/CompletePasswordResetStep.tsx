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
import { completePasswordResetSchema, CompletePasswordResetFormData } from '@/lib/validation/auth-schemas';

interface CompletePasswordResetStepProps {
  onComplete: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function CompletePasswordResetStep({ 
  onComplete, 
  isLoading, 
  setIsLoading 
}: CompletePasswordResetStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CompletePasswordResetFormData>({
    resolver: zodResolver(completePasswordResetSchema),
    mode: 'onChange',
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: CompletePasswordResetFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.completePasswordReset({
        newPassword: data.newPassword,
      });
      
      toast.success('Password has been reset successfully!');
      
      // Complete the flow
      onComplete();
      
    } catch (err: any) {
      
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          'Failed to reset password. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = newPassword && newPassword.length >= 8;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription>
          OTP verified! Create a new secure password for your account.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a new secure password"
            {...register('newPassword')}
            className={errors.newPassword ? 'border-red-500' : ''}
            disabled={isLoading}
            autoComplete="new-password"
            autoFocus
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
        {errors.newPassword && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.newPassword.message}
          </p>
        )}
      </div>



      {/* Password Requirements */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2">Password Requirements:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Contains at least one uppercase letter</li>
          <li>• Contains at least one lowercase letter</li>
          <li>• Contains at least one number</li>
          <li>• Contains at least one special character</li>
        </ul>
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
            Resetting Password...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Reset Password
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          After resetting your password, all existing sessions will be terminated for security.
        </p>
      </div>
    </form>
  );
}
