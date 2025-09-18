'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Import step components
import { RequestPasswordResetStep } from '@/components/auth/password-reset/RequestPasswordResetStep';
import { VerifyPasswordResetOTPStep } from '@/components/auth/password-reset/VerifyPasswordResetOTPStep';
import { CompletePasswordResetStep } from '@/components/auth/password-reset/CompletePasswordResetStep';

// Types for password reset state
interface PasswordResetState {
  step: 1 | 2 | 3;
  email: string;
  isComplete: boolean;
}

const STEP_TITLES = {
  1: 'Reset Password',
  2: 'Verify Email',
  3: 'New Password',
};

const STEP_DESCRIPTIONS = {
  1: 'Enter your email address to receive a reset code',
  2: 'Enter the verification code sent to your email',
  3: 'Create a new secure password for your account',
};

export default function PasswordResetFlowPage() {
  const router = useRouter();
  const [resetState, setResetState] = useState<PasswordResetState>({
    step: 1,
    email: '',
    isComplete: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleStepComplete = (stepData: any) => {
    setResetState(prev => ({
      ...prev,
      ...stepData,
      step: Math.min(prev.step + 1, 3) as 1 | 2 | 3,
    }));
  };

  const handleResetComplete = () => {
    setResetState(prev => ({
      ...prev,
      isComplete: true,
    }));
    
    toast.success('Password reset completed successfully!');
    
    // Redirect to login page
    setTimeout(() => {
      router.push('/auth/login');
    }, 2000);
  };

  const handleBackStep = () => {
    if (resetState.step > 1) {
      setResetState(prev => ({
        ...prev,
        step: Math.max(prev.step - 1, 1) as 1 | 2 | 3,
      }));
    }
  };

  const handleStartOver = () => {
    setResetState({
      step: 1,
      email: '',
      isComplete: false,
    });
  };

  const progressPercentage = (resetState.step / 3) * 100;

  if (resetState.isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Password Reset Complete!
            </CardTitle>
            <CardDescription>
              Your password has been successfully updated. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {STEP_TITLES[resetState.step]}
              </CardTitle>
              <CardDescription className="mt-1">
                {STEP_DESCRIPTIONS[resetState.step]}
              </CardDescription>
            </div>
            {resetState.step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackStep}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {resetState.step} of 3</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        </CardHeader>

        <CardContent>
          {resetState.step === 1 && (
            <RequestPasswordResetStep
              onComplete={handleStepComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          {resetState.step === 2 && (
            <VerifyPasswordResetOTPStep
              email={resetState.email}
              onComplete={handleStepComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          {resetState.step === 3 && (
            <CompletePasswordResetStep
              onComplete={handleResetComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-medium"
                onClick={() => router.push('/auth/login')}
              >
                Sign in here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
