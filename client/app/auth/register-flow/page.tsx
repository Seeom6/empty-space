'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Import step components (we'll create these)
import { ValidateInviteStep } from '@/components/auth/registration/ValidateInviteStep';
import { RegisterEmailStep } from '@/components/auth/registration/RegisterEmailStep';
import { VerifyOTPStep } from '@/components/auth/registration/VerifyOTPStep';
import { CompleteRegistrationStep } from '@/components/auth/registration/CompleteRegistrationStep';

// Types for registration state
interface RegistrationState {
  step: 1 | 2 | 3 | 4;
  inviteCode: string;
  position?: {
    id: string;
    name: string;
    department: {
      id: string;
      name: string;
    };
  };
  privileges?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  email: string;
  firstName: string;
  lastName: string;
  isComplete: boolean;
}

const STEP_TITLES = {
  1: 'Validate Invite Code',
  2: 'Personal Information',
  3: 'Verify Email',
  4: 'Set Password',
};

const STEP_DESCRIPTIONS = {
  1: 'Enter your invite code to begin registration',
  2: 'Provide your email and personal details',
  3: 'Verify your email address with the OTP code',
  4: 'Create a secure password for your account',
};

export default function RegistrationFlowPage() {
  const router = useRouter();
  const [registrationState, setRegistrationState] = useState<RegistrationState>({
    step: 1,
    inviteCode: '',
    email: '',
    firstName: '',
    lastName: '',
    isComplete: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleStepComplete = (stepData: any) => {
    setRegistrationState(prev => ({
      ...prev,
      ...stepData,
      step: Math.min(prev.step + 1, 4) as 1 | 2 | 3 | 4,
    }));
  };

  const handleRegistrationComplete = (userData: any) => {
    setRegistrationState(prev => ({
      ...prev,
      isComplete: true,
    }));
    
    toast.success('Registration completed successfully!');
    
    // Redirect to dashboard or login page
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  const handleBackStep = () => {
    if (registrationState.step > 1) {
      setRegistrationState(prev => ({
        ...prev,
        step: Math.max(prev.step - 1, 1) as 1 | 2 | 3 | 4,
      }));
    }
  };

  const handleStartOver = () => {
    setRegistrationState({
      step: 1,
      inviteCode: '',
      email: '',
      firstName: '',
      lastName: '',
      isComplete: false,
    });
  };

  const progressPercentage = (registrationState.step / 4) * 100;

  if (registrationState.isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto mb-4" aria-hidden="true">
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-600">
              Registration Complete!
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Your account has been successfully created. You will be redirected to the dashboard shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
              aria-label="Navigate to dashboard"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <CardTitle className="text-xl sm:text-2xl font-bold">
                {STEP_TITLES[registrationState.step]}
              </CardTitle>
              <CardDescription className="mt-1 text-sm sm:text-base">
                {STEP_DESCRIPTIONS[registrationState.step]}
              </CardDescription>
            </div>
            {registrationState.step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackStep}
                className="flex items-center gap-2 self-center sm:self-auto"
                aria-label="Go back to previous step"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Back</span>
              </Button>
            )}
          </div>

          <div className="space-y-2" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {registrationState.step} of 4</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="w-full" aria-label={`Registration progress: ${Math.round(progressPercentage)}% complete`} />
          </div>
        </CardHeader>

        <CardContent>
          {registrationState.step === 1 && (
            <ValidateInviteStep
              onComplete={handleStepComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          {registrationState.step === 2 && (
            <RegisterEmailStep
              inviteCode={registrationState.inviteCode}
              onComplete={handleStepComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          {registrationState.step === 3 && (
            <VerifyOTPStep
              email={registrationState.email}
              onComplete={handleStepComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          {registrationState.step === 4 && (
            <CompleteRegistrationStep
              registrationData={registrationState}
              onComplete={handleRegistrationComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
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
