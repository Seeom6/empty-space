'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Shield, ArrowLeft, RefreshCw, Mail } from 'lucide-react';

import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OTPField } from '@/components/ui/otp-input';
import { otpVerificationSchema, type OTPVerificationFormData } from '@/lib/validation/auth-schemas';
import { cn } from '@/lib/utils';

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTP, sendOTP, isLoading } = useAuth();
  
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const {
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<OTPVerificationFormData>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: '',
    },
  });

  const otpValue = watch('otp');

  // Get email and token from URL params or localStorage
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
    
    // Start countdown for resend
    setCountdown(60);
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: OTPVerificationFormData) => {
    try {
      await verifyOTP(data.otp, token);
      toast.success('Email verified successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('OTP verification error:', error);
    }
  };

  const handleOTPChange = (value: string) => {
    setValue('otp', value);
  };

  const handleOTPComplete = (value: string) => {
    if (value.length === 5) {
      handleSubmit(onSubmit)();
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || !email) return;
    
    setIsResending(true);
    try {
      const newToken = await sendOTP(email);
      setToken(newToken);
      setCountdown(60);
      toast.success('New verification code sent!');
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a verification code to your email
          </p>
          {email && (
            <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
              {email}
            </p>
          )}
        </div>

        {/* Verification Form */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>Enter Verification Code</CardTitle>
            <CardDescription>
              Please enter the 5-digit code we sent to your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* OTP Input */}
              <OTPField
                length={5}
                value={otpValue}
                onChange={handleOTPChange}
                onComplete={handleOTPComplete}
                error={errors.otp?.message}
                disabled={isSubmitting}
                helperText="Enter the 5-digit code from your email"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                loadingText="Verifying..."
                disabled={isSubmitting || otpValue.length !== 5}
              >
                Verify Email
              </Button>
            </form>

            {/* Resend Section */}
            <div className="mt-6 text-center space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the code?
              </div>
              
              {countdown > 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Resend available in {countdown} seconds
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={isResending || !email}
                  isLoading={isResending}
                  loadingText="Sending..."
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Code
                </Button>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Having trouble?
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• The code expires after 10 minutes</li>
                <li>• Contact support if you continue having issues</li>
              </ul>
            </div>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            For your security, this verification code will expire in 10 minutes.
            Never share this code with anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
