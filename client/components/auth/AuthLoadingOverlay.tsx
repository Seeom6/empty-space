'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function AuthLoadingOverlay({ 
  isLoading, 
  message = 'Processing...', 
  className 
}: AuthLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="bg-card border rounded-lg p-6 shadow-lg flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground text-center">
          {message}
        </p>
      </div>
    </div>
  );
}
