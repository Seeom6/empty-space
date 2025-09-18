/**
 * Test script to validate cookie-based authentication implementation
 * This file can be used for manual testing and validation
 */

import { AuthService } from './services/authService';
import { apiClient } from './client';

export const testCookieAuthentication = {
  /**
   * Test if cookies are being read correctly
   */
  testCookieReading: () => {
    console.log('🧪 Testing cookie reading...');
    
    const accessToken = AuthService.getAccessTokenFromCookie();
    const refreshToken = AuthService.getRefreshTokenFromCookie();
    const isAuthenticated = AuthService.isAuthenticatedViaCookies();
    
    console.log('📊 Cookie Test Results:', {
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'Not found',
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'Not found',
      isAuthenticated
    });
    
    return { accessToken, refreshToken, isAuthenticated };
  },

  /**
   * Test API client configuration
   */
  testApiClientConfig: () => {
    console.log('🧪 Testing API client configuration...');
    
    const config = apiClient.defaults;
    console.log('📊 API Client Config:', {
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      timeout: config.timeout,
      hasAuthHeader: !!config.headers.common['Authorization']
    });
    
    return config;
  },

  /**
   * Test login flow (requires valid credentials)
   */
  testLoginFlow: async (credentials: { email: string; password: string }) => {
    console.log('🧪 Testing login flow...');
    
    try {
      const response = await AuthService.adminLogin(credentials);
      console.log('✅ Login successful:', response);
      
      // Check if cookies were set
      setTimeout(() => {
        const cookieTest = testCookieAuthentication.testCookieReading();
        console.log('🍪 Post-login cookie check:', cookieTest);
      }, 100);
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  /**
   * Test logout flow
   */
  testLogoutFlow: async () => {
    console.log('🧪 Testing logout flow...');
    
    try {
      await AuthService.logout();
      console.log('✅ Logout successful');
      
      // Check if cookies were cleared
      setTimeout(() => {
        const cookieTest = testCookieAuthentication.testCookieReading();
        console.log('🍪 Post-logout cookie check:', cookieTest);
      }, 100);
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  },

  /**
   * Test token refresh flow
   */
  testRefreshFlow: async () => {
    console.log('🧪 Testing token refresh flow...');
    
    try {
      const response = await AuthService.refreshToken();
      console.log('✅ Token refresh successful:', response);
      
      // Check if new cookies were set
      setTimeout(() => {
        const cookieTest = testCookieAuthentication.testCookieReading();
        console.log('🍪 Post-refresh cookie check:', cookieTest);
      }, 100);
      
      return response;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw error;
    }
  },

  /**
   * Test user profile retrieval
   */
  testUserProfile: async () => {
    console.log('🧪 Testing user profile retrieval...');
    
    try {
      const response = await AuthService.me();
      console.log('✅ User profile retrieved:', response);
      return response;
    } catch (error) {
      console.error('❌ User profile retrieval failed:', error);
      throw error;
    }
  },

  /**
   * Run all tests
   */
  runAllTests: async (credentials?: { email: string; password: string }) => {
    console.log('🚀 Running all authentication tests...');
    
    const results = {
      cookieReading: null as any,
      apiClientConfig: null as any,
      loginFlow: null as any,
      userProfile: null as any,
      refreshFlow: null as any,
      logoutFlow: null as any
    };
    
    try {
      // Test 1: Cookie reading
      results.cookieReading = testCookieAuthentication.testCookieReading();
      
      // Test 2: API client config
      results.apiClientConfig = testCookieAuthentication.testApiClientConfig();
      
      // Test 3: Login flow (if credentials provided)
      if (credentials) {
        results.loginFlow = await testCookieAuthentication.testLoginFlow(credentials);
        
        // Test 4: User profile (after login)
        results.userProfile = await testCookieAuthentication.testUserProfile();
        
        // Test 5: Token refresh (after login)
        results.refreshFlow = await testCookieAuthentication.testRefreshFlow();
        
        // Test 6: Logout flow
        results.logoutFlow = await testCookieAuthentication.testLogoutFlow();
      }
      
      console.log('🎉 All tests completed successfully!');
      return results;
      
    } catch (error) {
      console.error('💥 Test suite failed:', error);
      throw error;
    }
  }
};

// Export for use in browser console or other test files
if (typeof window !== 'undefined') {
  (window as any).testCookieAuth = testCookieAuthentication;
  console.log('🧪 Cookie authentication tests available at window.testCookieAuth');
}
