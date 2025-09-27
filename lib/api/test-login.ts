/**
 * Test login functionality
 * This file helps debug the login flow
 */

import { AuthService } from './services/authService';

export const testLogin = async (credentials: { email: string; password: string }) => {
  console.log('🧪 Testing login flow...');
  console.log('Credentials:', { email: credentials.email, password: '***' });
  
  try {
    // Test the login
    const response = await AuthService.login(credentials);
    console.log('✅ Login successful!');
    console.log('Response:', response);
    
    // Test if we can get user info
    try {
      const userInfo = await AuthService.me();
      console.log('✅ User info retrieved:', userInfo);
    } catch (userError) {
      console.log('⚠️ Could not retrieve user info:', userError);
    }
    
    // Check if cookies are set
    const accessToken = AuthService.getAccessTokenFromCookie();
    const refreshToken = AuthService.getRefreshTokenFromCookie();
    console.log('🍪 Cookies:', { 
      accessToken: accessToken ? 'Present' : 'Missing',
      refreshToken: refreshToken ? 'Present' : 'Missing'
    });
    
    return response;
  } catch (error: any) {
    console.error('❌ Login failed:', error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Test with admin credentials
export const testAdminLogin = () => {
  return testLogin({
    email: 'admin@admin.com',
    password: 'admin123' // Replace with actual admin password
  });
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testLogin = testLogin;
  (window as any).testAdminLogin = testAdminLogin;
  console.log('🔧 Login test functions available: testLogin(credentials), testAdminLogin()');
}
