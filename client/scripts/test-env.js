#!/usr/bin/env node

/**
 * Test script to verify environment variables are properly loaded
 */

console.log('🔍 Testing Environment Variables Configuration...\n');

// Test environment variables
const envVars = {
  'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL,
  'NEXT_PUBLIC_API_TIMEOUT': process.env.NEXT_PUBLIC_API_TIMEOUT,
  'NEXT_PUBLIC_APP_ENV': process.env.NEXT_PUBLIC_APP_ENV,
  'NEXT_PUBLIC_APP_NAME': process.env.NEXT_PUBLIC_APP_NAME,
  'NODE_ENV': process.env.NODE_ENV,
};

console.log('📋 Environment Variables Status:');
console.log('================================');

let allGood = true;

Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = value || 'NOT SET';
  console.log(`${status} ${key}: ${displayValue}`);
  
  if (!value && key.startsWith('NEXT_PUBLIC_')) {
    allGood = false;
  }
});

console.log('\n🔧 Configuration Analysis:');
console.log('==========================');

// Check API URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (apiUrl) {
  console.log(`✅ API URL configured: ${apiUrl}`);
  
  // Validate URL format
  try {
    new URL(apiUrl);
    console.log('✅ API URL format is valid');
  } catch (error) {
    console.log('❌ API URL format is invalid');
    allGood = false;
  }
} else {
  console.log('❌ API URL not configured - using default: http://localhost:12001/api/v1');
}

// Check timeout
const timeout = process.env.NEXT_PUBLIC_API_TIMEOUT;
if (timeout) {
  const timeoutNum = parseInt(timeout);
  if (isNaN(timeoutNum)) {
    console.log('❌ API timeout is not a valid number');
    allGood = false;
  } else {
    console.log(`✅ API timeout configured: ${timeoutNum}ms`);
  }
} else {
  console.log('❌ API timeout not configured - using default: 10000ms');
}

// Check app environment
const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
if (appEnv) {
  console.log(`✅ App environment: ${appEnv}`);
} else {
  console.log('❌ App environment not configured');
}

// Check Node environment
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv) {
  console.log(`✅ Node environment: ${nodeEnv}`);
} else {
  console.log('⚠️  Node environment not set - this is usually set by Next.js');
}

console.log('\n🎯 Summary:');
console.log('===========');

if (allGood) {
  console.log('✅ All environment variables are properly configured!');
  console.log('🚀 Your client application should work correctly.');
} else {
  console.log('❌ Some environment variables are missing or invalid.');
  console.log('📝 Please check your .env file and ensure all required variables are set.');
}

console.log('\n📁 Expected files:');
console.log('==================');
console.log('✅ .env.example (template file)');
console.log('✅ .env (your local configuration)');
console.log('⚠️  .env.local (optional, for local overrides)');
console.log('⚠️  .env.production (optional, for production)');

console.log('\n🔒 Security Notes:');
console.log('==================');
console.log('• .env files are ignored by git (check .gitignore)');
console.log('• Only NEXT_PUBLIC_ variables are exposed to the browser');
console.log('• Authentication uses HTTP-only cookies (no tokens in localStorage)');
console.log('• API requests include credentials for cookie-based auth');

process.exit(allGood ? 0 : 1);
