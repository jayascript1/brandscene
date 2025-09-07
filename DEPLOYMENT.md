# BrandScene Deployment Guide

This guide covers deploying BrandScene to various platforms and environments.

## 🚀 Quick Deploy

### Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy**:
```bash
vercel --prod
```

3. **Set Environment Variables**:
```bash
vercel env add VITE_OPENAI_API_KEY
```

### Netlify

1. **Build locally**:
```bash
npm run build
```

2. **Deploy to Netlify**:
```bash
netlify deploy --prod --dir=dist
```

3. **Set Environment Variables** in Netlify dashboard:
- `VITE_OPENAI_API_KEY`: Your OpenAI API key

## 🐳 Docker Deployment

### Local Docker Build

```bash
# Build the image
docker build -t brandscene .

# Run the container
docker run -p 80:80 brandscene
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  brandscene:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

### Kubernetes

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: brandscene
spec:
  replicas: 3
  selector:
    matchLabels:
      app: brandscene
  template:
    metadata:
      labels:
        app: brandscene
    spec:
      containers:
      - name: brandscene
        image: brandscene:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: brandscene-service
spec:
  selector:
    app: brandscene
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## ☁️ Cloud Platform Deployment

### AWS S3 + CloudFront

1. **Build the app**:
```bash
npm run build
```

2. **Upload to S3**:
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

3. **Configure CloudFront** with:
- Origin: S3 bucket
- Default root object: `index.html`
- Error pages: Redirect 404 to `/index.html`

### Google Cloud Platform

1. **Deploy to App Engine**:
```bash
gcloud app deploy app.yaml
```

2. **Create `app.yaml`**:
```yaml
runtime: nodejs18
service: default

handlers:
- url: /static
  static_dir: dist/static
  secure: always

- url: /.*
  static_files: dist/index.html
  upload: dist/index.html
  secure: always
```

### Azure Static Web Apps

1. **Install Azure CLI**:
```bash
npm install -g @azure/static-web-apps-cli
```

2. **Deploy**:
```bash
swa deploy dist
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
VITE_APP_NAME=BrandScene
NODE_ENV=production
```

### Optional Environment Variables

```env
# Analytics (if using)
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=your_sentry_dsn

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

## 🔒 Security Configuration

### Content Security Policy

The app includes a strict CSP. Customize in `security-headers.conf`:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.openai.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com; frame-ancestors 'none';" always;
```

### API Key Security

- **Development**: Store in `.env` file
- **Production**: Use platform-specific secret management
- **Never commit API keys** to version control

## 📊 Monitoring & Analytics

### Performance Monitoring

1. **Lighthouse CI**:
```bash
npm install -g @lhci/cli
lhci autorun
```

2. **Bundle Analysis**:
```bash
npm run build
npm run analyze
```

### Error Monitoring

Configure Sentry in production:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - curl -X POST $DEPLOY_HOOK
  only:
    - main
```

## 🧪 Testing Deployment

### Pre-deployment Checklist

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables configured
- [ ] API key is valid
- [ ] SSL certificate configured
- [ ] Domain configured
- [ ] Analytics tracking enabled
- [ ] Error monitoring configured

### Post-deployment Verification

- [ ] Homepage loads correctly
- [ ] Image upload works
- [ ] AI generation functions
- [ ] 3D carousel works
- [ ] Mobile responsiveness
- [ ] Performance scores (Lighthouse)
- [ ] Error monitoring active
- [ ] Analytics tracking

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version (18+ required)
   - Verify all dependencies installed
   - Check TypeScript errors

2. **API Errors**:
   - Verify OpenAI API key is valid
   - Check API key permissions
   - Verify network connectivity

3. **Performance Issues**:
   - Enable gzip compression
   - Optimize images
   - Use CDN for static assets

4. **CORS Errors**:
   - Configure proper CORS headers
   - Check API endpoint configuration

### Support

For deployment issues:
- Check the logs: `docker logs container_name`
- Verify environment variables
- Test locally first
- Check platform-specific documentation

## 📈 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build
npm run analyze

# Optimize images
npm run optimize-images

# Generate critical CSS
npm run critical
```

### Runtime Optimization

- Enable service worker for caching
- Use lazy loading for components
- Implement progressive loading
- Optimize API calls with caching

## 🔄 Updates & Maintenance

### Updating the Application

1. **Pull latest changes**:
```bash
git pull origin main
```

2. **Update dependencies**:
```bash
npm update
```

3. **Test locally**:
```bash
npm run dev
```

4. **Deploy**:
```bash
npm run deploy
```

### Monitoring

- Set up uptime monitoring
- Configure error alerting
- Monitor API usage
- Track performance metrics
