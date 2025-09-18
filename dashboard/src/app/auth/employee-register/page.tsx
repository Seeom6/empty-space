'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { UserPlus, ArrowLeft, Building } from 'lucide-react';

import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { employeeRegistrationSchema, type EmployeeRegistrationFormData } from '@/lib/validation/auth-schemas';
import { cn } from '@/lib/utils';

export default function EmployeeRegisterPage() {
  const router = useRouter();
  const { registerEmployee, isLoading } = useAuth();
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [otpToken, setOtpToken] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<EmployeeRegistrationFormData>({
    resolver: zodResolver(employeeRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      inviteCode: '',
      image: '',
      birthday: undefined,
    },
  });

  const onSubmit = async (data: EmployeeRegistrationFormData) => {
    try {
      const { confirmPassword, ...registrationData } = data;

      // Convert empty strings to undefined for optional fields
      const cleanedData = {
        ...registrationData,
        phoneNumber: registrationData.phoneNumber || undefined,
        image: registrationData.image || undefined,
      };

      const token = await registerEmployee(cleanedData);
      setOtpToken(token);
      setStep('verification');
      toast.success('Employee registration successful! Please check your email for verification code.');
    } catch (error) {
      console.error('Employee registration error:', error);
    }
  };

  const handleVerificationComplete = () => {
    router.push('/dashboard');
  };

  if (step === 'verification') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                We've sent a verification code to your email address. Please enter it below to complete your employee registration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Check your email and enter the 5-digit verification code.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setStep('form')}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Registration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Building className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Employee Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join your organization with an invite code
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>
              Please fill in your details and provide the invite code from your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Invite Code - Prominent placement */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <FormField
                  label="Invite Code"
                  placeholder="$INV-2024-ABC123"
                  error={errors.inviteCode?.message}
                  helperText="Enter the invite code provided by your organization"
                  isRequired
                  {...register('inviteCode')}
                />
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  placeholder="Enter your first name"
                  error={errors.firstName?.message}
                  isRequired
                  {...register('firstName')}
                />
                <FormField
                  label="Last Name"
                  placeholder="Enter your last name"
                  error={errors.lastName?.message}
                  isRequired
                  {...register('lastName')}
                />
              </div>

              {/* Contact Information */}
              <FormField
                label="Email Address"
                type="email"
                placeholder="your.email@company.com"
                error={errors.email?.message}
                helperText="Use your work email address"
                isRequired
                {...register('email')}
              />

              <FormField
                label="Phone Number"
                type="tel"
                placeholder="+1234567890 (optional)"
                error={errors.phoneNumber?.message}
                helperText="Include country code if provided"
                {...register('phoneNumber')}
              />

              {/* Password Fields */}
              <FormField
                label="Password"
                type="password"
                placeholder="Create a strong password"
                error={errors.password?.message}
                helperText="Must be at least 8 characters with uppercase, lowercase, and number"
                isRequired
                showPasswordToggle
                {...register('password')}
              />

              <FormField
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                isRequired
                showPasswordToggle
                {...register('confirmPassword')}
              />

              {/* Optional Fields */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Optional Information
                </h4>
                
                <FormField
                  label="Profile Image URL"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  error={errors.image?.message}
                  helperText="Link to your profile picture"
                  {...register('image')}
                />

                <FormField
                  label="Birthday"
                  type="date"
                  error={errors.birthday?.message}
                  {...register('birthday', {
                    setValueAs: (value) => value ? new Date(value) : undefined
                  })}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                loadingText="Creating employee account..."
                disabled={isSubmitting}
              >
                Create Employee Account
              </Button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/auth/login"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  User Registration
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            Don't have an invite code?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Contact your HR department
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
