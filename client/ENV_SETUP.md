# Environment Configuration Guide

This guide explains how to set up and manage environment variables for the client application.

## 📁 Environment Files

### File Structure
```
client/
├── .env.example          # Template file (committed to git)
├── .env                  # Local development (ignored by git)
├── .env.local           # Local overrides (ignored by git)
├── .env.development     # Development environment (optional)
├── .env.production      # Production environment (optional)
└── .gitignore           # Ensures .env* files are ignored
```

### File Priority (Next.js loading order)
1. `.env.local` (highest priority)
2. `.env.development` / `.env.production` (based on NODE_ENV)
3. `.env`
4. `.env.example` (lowest priority)

## 🔧 Required Environment Variables

### API Configuration
```bash
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:12001/api/v1

# Request timeout in milliseconds
NEXT_PUBLIC_API_TIMEOUT=10000
```

### Application Configuration
```bash
# Application environment
NEXT_PUBLIC_APP_ENV=development

# Application name
NEXT_PUBLIC_APP_NAME=Employee Management System
```

### Development Configuration
```bash
# Node environment (usually set automatically by Next.js)
NODE_ENV=development
```

## 🚀 Quick Setup

### 1. Copy the Example File
```bash
cd client
cp .env.example .env
```

### 2. Edit Your Configuration
```bash
# Edit the .env file with your specific values
nano .env
```

### 3. Verify Configuration
```bash
# Test environment variables
npm run test:env

# Or visit the test page when running the app
# http://localhost:3000/test-env
```

## 🔒 Security Guidelines

### Public vs Private Variables
- **NEXT_PUBLIC_*** variables are exposed to the browser
- Variables without the prefix are server-side only
- Never put sensitive data in NEXT_PUBLIC_ variables

### Authentication Security
- This app uses HTTP-only cookies for authentication
- No tokens are stored in localStorage or sessionStorage
- API requests automatically include credentials

### Git Security
- All `.env*` files are ignored by git (except `.env.example`)
- Never commit actual environment values
- Use `.env.example` as a template for team members

## 🧪 Testing Environment Configuration

### Method 1: Command Line Test
```bash
npm run test:env
```

### Method 2: Browser Test Page
1. Start the development server: `npm run dev`
2. Visit: `http://localhost:3000/test-env`
3. Check all variables are properly loaded

### Method 3: Manual Verification
Check the browser console for API client logs:
```
🌐 API Client configured with baseURL: http://localhost:12001/api/v1
```

## 🌍 Environment-Specific Setup

### Development
```bash
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:12001/api/v1
NEXT_PUBLIC_APP_ENV=development
```

### Production
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourapp.com/v1
NEXT_PUBLIC_APP_ENV=production
```

### Local Overrides
```bash
# .env.local (for personal development preferences)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_API_TIMEOUT=15000
```

## 🔧 Troubleshooting

### Variables Not Loading
1. Check file names (no typos in `.env`)
2. Restart the development server after changes
3. Verify NEXT_PUBLIC_ prefix for client-side variables
4. Check .gitignore isn't excluding your .env file

### API Connection Issues
1. Verify NEXT_PUBLIC_API_URL is correct
2. Check if backend server is running
3. Ensure CORS is configured on the backend
4. Check browser network tab for request details

### Common Mistakes
- Forgetting `NEXT_PUBLIC_` prefix for client variables
- Using quotes around values (not needed in .env files)
- Not restarting server after .env changes
- Committing .env files to git

## 📝 Example Configurations

### Minimal Setup
```bash
NEXT_PUBLIC_API_URL=http://localhost:12001/api/v1
NEXT_PUBLIC_APP_ENV=development
```

### Complete Setup
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:12001/api/v1
NEXT_PUBLIC_API_TIMEOUT=10000

# App Configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=Employee Management System

# Development Configuration
NODE_ENV=development
```

## 🔗 Related Documentation

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Authentication System](./AUTHENTICATION_COOKIE_MIGRATION.md)
- [API Client Configuration](./lib/api/README.md)

## 💡 Tips

1. Use `.env.local` for personal development preferences
2. Keep `.env.example` updated when adding new variables
3. Document any new environment variables in this file
4. Use the test page (`/test-env`) to verify configuration
5. Check browser console for API client initialization logs
