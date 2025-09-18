'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

export function AuthCard({ 
  title, 
  description, 
  children, 
  className,
  headerContent,
  footerContent 
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className={cn("w-full max-w-lg", className)}>
        <CardHeader className="space-y-4">
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="mt-2">
                {description}
              </CardDescription>
            )}
          </div>
          {headerContent}
        </CardHeader>
        
        <CardContent>
          {children}
          {footerContent}
        </CardContent>
      </Card>
    </div>
  );
}
