'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';

import { AuthService } from '@/lib/api/services/authService';
import { validateInviteCodeSchema, ValidateInviteCodeFormData } from '@/lib/validation/auth-schemas';

interface ValidateInviteStepProps {
  onComplete: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function ValidateInviteStep({ onComplete, isLoading, setIsLoading }: ValidateInviteStepProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ValidateInviteCodeFormData>({
    resolver: zodResolver(validateInviteCodeSchema),
    mode: 'onChange',
  });

  const inviteCode = watch('inviteCode');

  const onSubmit = async (data: ValidateInviteCodeFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.validateInviteCode(data);
      
      toast.success('Invite code validated successfully!');
      
      // Pass the validated data to the next step
      onComplete({
        inviteCode: data.inviteCode,
        position: response.data.position,
        privileges: response.data.privileges,
      });
      
    } catch (err: any) {
      
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          'Invalid invite code. Please check and try again.';
      
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
          Enter the invite code provided by your administrator. It should be in the format: $INV-YYYY-XXXXXX
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="inviteCode">Invite Code</Label>
        <Input
          id="inviteCode"
          type="text"
          placeholder="$INV-2024-ABC123"
          {...register('inviteCode')}
          className={errors.inviteCode ? 'border-red-500' : ''}
          disabled={isLoading}
          autoComplete="off"
          autoFocus
        />
        {errors.inviteCode && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.inviteCode.message}
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
        disabled={isLoading || !inviteCode}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validating...
          </>
        ) : (
          'Validate Invite Code'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an invite code?{' '}
          <Button variant="link" className="p-0 h-auto text-sm">
            Contact your administrator
          </Button>
        </p>
      </div>
    </form>
  );
}
