'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthError {
  code?: number;
  message: string;
  type?: string;
  details?: {
    field?: string;
    retryAfter?: number;
    maxAttempts?: number;
    remainingAttempts?: number;
  };
}

interface UseAuthFlowOptions {
  onSuccess?: (data?: any) => void;
  onError?: (error: AuthError) => void;
  redirectOnSuccess?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useAuthFlow(options: UseAuthFlowOptions = {}) {
  const {
    onSuccess,
    onError,
    redirectOnSuccess,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const executeAuthAction = useCallback(async (
    action: () => Promise<any>,
    successMessage?: string,
    errorMessage?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await action();

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      if (redirectOnSuccess) {
        router.push(redirectOnSuccess);
      }

      return result;
    } catch (err: any) {
      console.error('Auth action failed:', err);

      const authError: AuthError = {
        code: err.response?.data?.error?.code,
        message: err.response?.data?.error?.message || 
                err.response?.data?.message || 
                errorMessage || 
                'An unexpected error occurred',
        type: err.response?.data?.error?.type,
        details: err.response?.data?.error?.details,
      };

      setError(authError);

      if (showErrorToast) {
        toast.error(authError.message);
      }

      if (onError) {
        onError(authError);
      }

      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, redirectOnSuccess, showSuccessToast, showErrorToast, router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (action: () => Promise<any>) => {
    if (isLoading) return;
    
    try {
      setError(null);
      await executeAuthAction(action);
    } catch (err) {
      // Error is already handled in executeAuthAction
    }
  }, [isLoading, executeAuthAction]);

  return {
    isLoading,
    error,
    executeAuthAction,
    clearError,
    retry,
  };
}

// Specialized hooks for different auth flows

export function useRegistrationFlow() {
  const [step, setStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<any>({});

  const authFlow = useAuthFlow({
    showSuccessToast: false, // Handle toasts manually for better UX
  });

  const nextStep = useCallback((data?: any) => {
    if (data) {
      setRegistrationData(prev => ({ ...prev, ...data }));
    }
    setStep(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(1, prev - 1));
  }, []);

  const resetFlow = useCallback(() => {
    setStep(1);
    setRegistrationData({});
    authFlow.clearError();
  }, [authFlow]);

  return {
    ...authFlow,
    step,
    registrationData,
    nextStep,
    prevStep,
    resetFlow,
  };
}

export function usePasswordResetFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  const authFlow = useAuthFlow({
    showSuccessToast: false, // Handle toasts manually
  });

  const nextStep = useCallback((data?: any) => {
    if (data?.email) {
      setEmail(data.email);
    }
    setStep(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(1, prev - 1));
  }, []);

  const resetFlow = useCallback(() => {
    setStep(1);
    setEmail('');
    authFlow.clearError();
  }, [authFlow]);

  return {
    ...authFlow,
    step,
    email,
    nextStep,
    prevStep,
    resetFlow,
  };
}

export function useLoginFlow() {
  return useAuthFlow({
    redirectOnSuccess: '/dashboard',
    showSuccessToast: true,
  });
}
