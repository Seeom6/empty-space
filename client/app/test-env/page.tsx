'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function TestEnvPage() {
  const envVars = {
    'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL,
    'NEXT_PUBLIC_API_TIMEOUT': process.env.NEXT_PUBLIC_API_TIMEOUT,
    'NEXT_PUBLIC_APP_ENV': process.env.NEXT_PUBLIC_APP_ENV,
    'NEXT_PUBLIC_APP_NAME': process.env.NEXT_PUBLIC_APP_NAME,
  };

  const getStatusIcon = (value: string | undefined) => {
    if (value) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (value: string | undefined) => {
    if (value) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Configured</Badge>;
    }
    return <Badge variant="destructive">Missing</Badge>;
  };

  const validateApiUrl = (url: string | undefined) => {
    if (!url) return { valid: false, message: 'Not configured' };
    
    try {
      new URL(url);
      return { valid: true, message: 'Valid URL format' };
    } catch {
      return { valid: false, message: 'Invalid URL format' };
    }
  };

  const validateTimeout = (timeout: string | undefined) => {
    if (!timeout) return { valid: false, message: 'Not configured' };
    
    const num = parseInt(timeout);
    if (isNaN(num)) {
      return { valid: false, message: 'Not a valid number' };
    }
    
    if (num < 1000) {
      return { valid: false, message: 'Too short (< 1000ms)' };
    }
    
    if (num > 60000) {
      return { valid: false, message: 'Too long (> 60000ms)' };
    }
    
    return { valid: true, message: `${num}ms (valid)` };
  };

  const apiUrlValidation = validateApiUrl(envVars.NEXT_PUBLIC_API_URL);
  const timeoutValidation = validateTimeout(envVars.NEXT_PUBLIC_API_TIMEOUT);

  const allConfigured = Object.values(envVars).every(value => value);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Environment Configuration Test</h1>
          <p className="text-muted-foreground mt-2">
            Verify that your client-side environment variables are properly configured
          </p>
        </div>

        {/* Overall Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {allConfigured ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              Overall Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allConfigured ? (
              <div className="text-green-600">
                ✅ All environment variables are configured correctly!
              </div>
            ) : (
              <div className="text-yellow-600">
                ⚠️ Some environment variables are missing or need attention.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>
              These variables are loaded from your .env file and exposed to the browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(value)}
                    <div>
                      <div className="font-medium">{key}</div>
                      <div className="text-sm text-muted-foreground">
                        {value || 'Not set'}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(value)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Validation Results */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Validation</CardTitle>
            <CardDescription>
              Detailed validation of your environment configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* API URL Validation */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {apiUrlValidation.valid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">API URL</div>
                    <div className="text-sm text-muted-foreground">
                      {apiUrlValidation.message}
                    </div>
                  </div>
                </div>
                <Badge variant={apiUrlValidation.valid ? "default" : "destructive"}>
                  {apiUrlValidation.valid ? "Valid" : "Invalid"}
                </Badge>
              </div>

              {/* Timeout Validation */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {timeoutValidation.valid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">API Timeout</div>
                    <div className="text-sm text-muted-foreground">
                      {timeoutValidation.message}
                    </div>
                  </div>
                </div>
                <Badge variant={timeoutValidation.valid ? "default" : "destructive"}>
                  {timeoutValidation.valid ? "Valid" : "Invalid"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>1. Environment Files:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li><code>.env.example</code> - Template file (committed to git)</li>
                  <li><code>.env</code> - Your local configuration (ignored by git)</li>
                  <li><code>.env.local</code> - Optional local overrides</li>
                </ul>
              </div>
              
              <div>
                <strong>2. Required Variables:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li><code>NEXT_PUBLIC_API_URL</code> - Backend API base URL</li>
                  <li><code>NEXT_PUBLIC_API_TIMEOUT</code> - Request timeout in milliseconds</li>
                  <li><code>NEXT_PUBLIC_APP_ENV</code> - Application environment</li>
                  <li><code>NEXT_PUBLIC_APP_NAME</code> - Application name</li>
                </ul>
              </div>

              <div>
                <strong>3. Security Notes:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Only <code>NEXT_PUBLIC_</code> variables are exposed to the browser</li>
                  <li>Authentication uses HTTP-only cookies (no tokens in localStorage)</li>
                  <li>API requests automatically include credentials for cookie-based auth</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
