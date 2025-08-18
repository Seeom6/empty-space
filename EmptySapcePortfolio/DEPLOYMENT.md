# Deployment Guide

This guide covers different deployment options for the Empty Space Portfolio project.

## 🚀 Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Automatic Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your repository
   - Deploy automatically

### Manual Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

## 🌐 Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `out` folder
   - Or connect your GitHub repository

## 🐳 Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY . .
   COPY --from=deps /app/node_modules ./node_modules
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   docker build -t empty-space-portfolio .
   docker run -p 3000:3000 empty-space-portfolio
   ```

## ☁️ AWS

### Using AWS Amplify

1. **Connect repository** to AWS Amplify
2. **Configure build settings**:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

## 🔧 Environment Variables

For production deployment, you may need to set:

```bash
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 📊 Performance Optimization

Before deploying:

1. **Optimize images**
2. **Enable compression**
3. **Set up CDN**
4. **Configure caching headers**

## 🔍 Monitoring

Consider setting up:
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance monitoring
- Uptime monitoring

## 🛡️ Security

- Enable HTTPS
- Set security headers
- Configure CSP
- Regular dependency updates

## 📝 Post-Deployment Checklist

- [ ] Test all functionality
- [ ] Verify theme switching
- [ ] Check language toggle
- [ ] Test responsive design
- [ ] Validate contact form
- [ ] Check performance scores
- [ ] Test on different browsers
- [ ] Verify SEO meta tags

## 🔄 Continuous Deployment

Set up automatic deployments on:
- Push to main branch
- Pull request merges
- Scheduled builds

## 📞 Support

If you encounter deployment issues:
1. Check the build logs
2. Verify environment variables
3. Test locally first
4. Check platform-specific documentation

Happy deploying! 🚀
