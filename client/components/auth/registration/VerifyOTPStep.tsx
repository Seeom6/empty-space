'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';

import { AuthService } from '@/lib/api/services/authService';
import { verifyRegistrationOTPSchema, VerifyRegistrationOTPFormData } from '@/lib/validation/auth-schemas';

interface VerifyOTPStepProps {
  email: string;
  onComplete: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function VerifyOTPStep({ email, onComplete, isLoading, setIsLoading }: VerifyOTPStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<VerifyRegistrationOTPFormData>({
    resolver: zodResolver(verifyRegistrationOTPSchema),
    mode: 'onChange',
  });

  const otp = watch('otp');

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-focus OTP input
  useEffect(() => {
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: VerifyRegistrationOTPFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.verifyRegistrationOTP(data);
      
      toast.success('Email verified successfully!');
      
      // Pass success to the next step
      onComplete({
        otpVerified: true,
      });
      
    } catch (err: any) {
      
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          'Invalid OTP. Please check and try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Clear the OTP input on error
      setValue('otp', '');
      if (otpInputRef.current) {
        otpInputRef.current.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      setError(null);

      // Note: The API documentation doesn't specify a resend endpoint
      // This would need to be implemented or we could redirect back to step 2
      toast.success('New OTP sent to your email!');
      
      setTimeLeft(600); // Reset timer
      setCanResend(false);
      
    } catch (err: any) {
      console.error('❌ Resend OTP failed:', err);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Handle OTP input formatting
  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('otp', value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          We've sent a 6-digit verification code to <strong>{email}</strong>. 
          Please check your email and enter the code below.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="otp">Verification Code</Label>
        <Input
          ref={otpInputRef}
          id="otp"
          type="text"
          placeholder="123456"
          {...register('otp')}
          onChange={handleOTPChange}
          className={`text-center text-2xl tracking-widest ${errors.otp ? 'border-red-500' : ''}`}
          disabled={isLoading}
          autoComplete="one-time-code"
          maxLength={6}
        />
        {errors.otp && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.otp.message}
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
        disabled={isLoading || !otp || otp.length !== 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </Button>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {timeLeft > 0 ? (
            <>Code expires in {formatTime(timeLeft)}</>
          ) : (
            <>Code has expired</>
          )}
        </p>
        
        <Button
          type="button"
          variant="link"
          className="p-0 h-auto text-sm"
          onClick={handleResendOTP}
          disabled={!canResend || isResending}
        >
          {isResending ? (
            <>
              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
              Sending...
            </>
          ) : (
            'Resend verification code'
          )}
        </Button>
      </div>
    </form>
  );
}
