"use client"

import { useState } from 'react'
import { AuthService } from '@/lib/api/services/authService'
import { useAuth } from '@/providers/auth-provider'

export default function TestAuthPage() {
  const [email, setEmail] = useState('admin@admin.com')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const { user, isAuthenticated, login } = useAuth()

  const testDirectLogin = async () => {
    setLoading(true)
    try {
      console.log('🧪 Testing direct AuthService.login...')
      const response = await AuthService.login({ email, password })
      setResult({ success: true, data: response })
      console.log('✅ Direct login successful:', response)
    } catch (error: any) {
      setResult({ success: false, error: error.message, details: error })
      console.error('❌ Direct login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const testProviderLogin = async () => {
    setLoading(true)
    try {
      console.log('🧪 Testing AuthProvider.login...')
      await login({ email, password })
      setResult({ success: true, message: 'Provider login successful' })
      console.log('✅ Provider login successful')
    } catch (error: any) {
      setResult({ success: false, error: error.message, details: error })
      console.error('❌ Provider login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const testJWTDecode = () => {
    const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiIzMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsImlzQWN0aXZlIjp0cnVlLCJpc1ZlcmlmaWVkIjpmYWxzZSwiYWNjb3VudFJvbGUiOiJzdXBlcl9hZG1pbiIsImlhdCI6MTc1ODUzNTc3MH0.mw8CXbP1LaH-vJwIjkRJU16-2wD8r-f0uUwrGL1_RYY'
    
    console.log('🧪 Testing JWT decode...')
    const decoded = AuthService.decodeJWT(sampleToken)
    setResult({ success: true, decoded, normalized: AuthService.normalizeRole(decoded?.accountRole) })
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="space-y-6">
        {/* Current Auth Status */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Current Auth Status</h2>
          <p>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          <p>User: {user ? JSON.stringify(user, null, 2) : 'None'}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border p-4 rounded">
          <h2 className="font-semibold mb-4">Login Test</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="admin@admin.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter password"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={testDirectLogin}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Test Direct Login
              </button>
              <button
                onClick={testProviderLogin}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Test Provider Login
              </button>
              <button
                onClick={testJWTDecode}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Test JWT Decode
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Test Result</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Debug Info</h2>
          <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
          <p>Cookies: {typeof document !== 'undefined' ? document.cookie : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}
