# 🚀 Deployment Guide

This guide covers deploying the Disaster Coordination App to production environments.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Ensure all required environment variables are set:

```env
# Required for production
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### 2. Database Setup
1. Create production Supabase project
2. Run `supabase/schema.sql` in SQL Editor
3. Configure Row Level Security (RLS) policies
4. Set up storage buckets for photos

### 3. Domain Configuration
- Configure custom domain in hosting provider
- Set up SSL certificate (automatic with Vercel/Netlify)
- Configure CORS settings in Supabase

## 🌐 Vercel Deployment (Recommended)

### Automatic Deployment
1. Connect GitHub repository to Vercel
2. Import project with default settings
3. Add environment variables in Vercel dashboard
4. Deploy automatically on git push

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### Environment Variables in Vercel
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

## 🚀 Alternative Platforms

### Netlify
```bash
# Build command
npm run build

# Publish directory
out

# Environment variables
# Set in Netlify dashboard under Site settings > Environment variables
```

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

### DigitalOcean App Platform
1. Create new app from GitHub repository
2. Configure build and run commands:
   - Build: `npm run build`
   - Run: `npm start`
3. Set environment variables in app settings

## 🔧 Production Optimizations

### Performance
```javascript
// next.config.js additions
module.exports = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Enable experimental features
  experimental: {
    optimizeCss: true,
    gzipSize: true,
  },
}
```

### Monitoring
```bash
# Add monitoring tools
npm install @vercel/analytics
npm install @sentry/nextjs
```

### Security Headers
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

## 📊 Post-Deployment

### 1. Health Checks
- Test all major features (submit request, claim, map loading)
- Verify real-time updates work
- Check photo upload functionality
- Test on mobile devices

### 2. Performance Monitoring
- Set up Core Web Vitals monitoring
- Monitor database query performance
- Track error rates and user metrics

### 3. Backup Strategy
- Enable Supabase automated backups
- Set up database replication if needed
- Regular exports of critical data

### 4. Scaling Considerations
- Monitor Supabase usage limits
- Consider CDN for global image delivery
- Set up load balancing for high traffic

## 🔐 Security Checklist

- [ ] All API endpoints have proper authentication
- [ ] Database RLS policies are correctly configured
- [ ] Environment variables are secure (no keys in code)
- [ ] HTTPS is enforced
- [ ] Content Security Policy is configured
- [ ] Rate limiting is implemented
- [ ] Input validation on all forms
- [ ] EXIF data privacy warnings are displayed

## 🚨 Emergency Procedures

### Quick Rollback
```bash
# Vercel
vercel rollback [deployment-url]

# Manual
git revert [commit-hash]
git push origin main
```

### Database Issues
```sql
-- Check database health
SELECT COUNT(*) FROM requests;
SELECT COUNT(*) FROM offers;

-- Check recent activity
SELECT created_at FROM requests ORDER BY created_at DESC LIMIT 5;
```

### Service Status Page
Create a simple status page to monitor:
- Database connectivity
- Storage availability  
- Real-time subscriptions
- API response times

## 📞 Support Contacts

- **Technical Issues**: [Your technical lead email]
- **Database Issues**: [DBA email]
- **Hosting Issues**: [DevOps email]
- **Emergency Contact**: [Emergency number]

---

**Remember: Lives may depend on this system working correctly. Always test thoroughly before deploying to production.** 🚨
