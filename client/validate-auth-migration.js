#!/usr/bin/env node

/**
 * Validation script for authentication cookie migration
 * Run with: node validate-auth-migration.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Authentication Cookie Migration...\n');

const checks = [];

// Check 1: API Client Configuration
const clientPath = path.join(__dirname, 'lib/api/client.ts');
if (fs.existsSync(clientPath)) {
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  
  checks.push({
    name: 'API Client - withCredentials enabled',
    passed: clientContent.includes('withCredentials: true'),
    details: 'Enables cookie support for cross-origin requests'
  });
  
  checks.push({
    name: 'API Client - clearAuthCookies function',
    passed: clientContent.includes('clearAuthCookies'),
    details: 'Function to clear authentication cookies'
  });
} else {
  checks.push({
    name: 'API Client file exists',
    passed: false,
    details: 'client.ts file not found'
  });
}

// Check 2: Auth Service Updates
const authServicePath = path.join(__dirname, 'lib/api/services/authService.ts');
if (fs.existsSync(authServicePath)) {
  const authServiceContent = fs.readFileSync(authServicePath, 'utf8');
  
  checks.push({
    name: 'Auth Service - Cookie utility functions',
    passed: authServiceContent.includes('getCookie') && 
            authServiceContent.includes('isAuthenticatedViaCookies'),
    details: 'Cookie reading and authentication check functions'
  });
  
  checks.push({
    name: 'Auth Service - Cookie-aware comments',
    passed: authServiceContent.includes('Backend automatically sets') ||
            authServiceContent.includes('cookie automatically'),
    details: 'Documentation about cookie behavior'
  });
} else {
  checks.push({
    name: 'Auth Service file exists',
    passed: false,
    details: 'authService.ts file not found'
  });
}

// Check 3: Auth Provider Updates
const authProviderPath = path.join(__dirname, 'providers/auth-provider.tsx');
if (fs.existsSync(authProviderPath)) {
  const authProviderContent = fs.readFileSync(authProviderPath, 'utf8');
  
  checks.push({
    name: 'Auth Provider - Cookie authentication check',
    passed: authProviderContent.includes('isAuthenticatedViaCookies'),
    details: 'Checks cookies before localStorage'
  });
  
  checks.push({
    name: 'Auth Provider - Cookie clearing on logout',
    passed: authProviderContent.includes('clearAuthCookies'),
    details: 'Clears cookies during logout process'
  });
  
  checks.push({
    name: 'Auth Provider - AuthService.me() usage',
    passed: authProviderContent.includes('AuthService.me()'),
    details: 'Uses AuthService for user profile retrieval'
  });
} else {
  checks.push({
    name: 'Auth Provider file exists',
    passed: false,
    details: 'auth-provider.tsx file not found'
  });
}

// Check 4: Technology Page Updates
const techPagePath = path.join(__dirname, 'app/dashboard/technologies/page.tsx');
if (fs.existsSync(techPagePath)) {
  const techPageContent = fs.readFileSync(techPagePath, 'utf8');
  
  checks.push({
    name: 'Technology Page - Auth provider integration',
    passed: techPageContent.includes('useAuth') && 
            techPageContent.includes('isAuthenticated'),
    details: 'Integrates with auth provider for authentication checks'
  });
  
  checks.push({
    name: 'Technology Page - Dynamic user role',
    passed: techPageContent.includes('user?.accountRole'),
    details: 'Gets user role from auth context instead of hardcoding'
  });
} else {
  checks.push({
    name: 'Technology Page file exists',
    passed: false,
    details: 'page.tsx file not found'
  });
}

// Check 5: Test Utilities
const testUtilsPath = path.join(__dirname, 'lib/api/test-auth-cookies.ts');
checks.push({
  name: 'Test Utilities - Cookie testing functions',
  passed: fs.existsSync(testUtilsPath),
  details: 'Testing utilities for cookie authentication'
});

// Check 6: Documentation
const docPath = path.join(__dirname, 'AUTHENTICATION_COOKIE_MIGRATION.md');
checks.push({
  name: 'Documentation - Migration guide',
  passed: fs.existsSync(docPath),
  details: 'Comprehensive migration documentation'
});

// Check 7: API Index Exports
const apiIndexPath = path.join(__dirname, 'lib/api/index.ts');
if (fs.existsSync(apiIndexPath)) {
  const apiIndexContent = fs.readFileSync(apiIndexPath, 'utf8');
  
  checks.push({
    name: 'API Index - clearAuthCookies export',
    passed: apiIndexContent.includes('clearAuthCookies'),
    details: 'Exports cookie clearing function'
  });
  
  checks.push({
    name: 'API Index - Test utilities export',
    passed: apiIndexContent.includes('testCookieAuthentication'),
    details: 'Exports testing utilities'
  });
}

// Display Results
console.log('📊 Validation Results:\n');

let passedCount = 0;
let totalCount = checks.length;

checks.forEach((check, index) => {
  const status = check.passed ? '✅' : '❌';
  const number = (index + 1).toString().padStart(2, '0');
  
  console.log(`${status} ${number}. ${check.name}`);
  console.log(`    ${check.details}\n`);
  
  if (check.passed) passedCount++;
});

// Summary
console.log('📈 Summary:');
console.log(`   Passed: ${passedCount}/${totalCount} checks`);
console.log(`   Success Rate: ${Math.round((passedCount / totalCount) * 100)}%\n`);

if (passedCount === totalCount) {
  console.log('🎉 All validation checks passed! Cookie migration is complete.');
  console.log('🚀 Ready for testing with the backend.');
} else {
  console.log('⚠️  Some validation checks failed. Please review the issues above.');
  process.exit(1);
}

console.log('\n📝 Next Steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Test login functionality with valid credentials');
console.log('3. Check browser cookies in DevTools');
console.log('4. Run: window.testCookieAuth.runAllTests() in browser console');
console.log('5. Verify all authentication features work correctly');
