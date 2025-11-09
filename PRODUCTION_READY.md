# 🚀 Production Deployment - Ready for 1000+ Students

## ✅ Pre-Deployment Checklist

### 1. Install All Dependencies
```powershell
cd "w:\mymeet'"
pnpm install
```

### 2. Verify Build Works
```powershell
pnpm build
```

### 3. Test Production Build Locally
```powershell
pnpm start
```
Test at http://localhost:3000

---

## 🔥 Firebase Production Setup

### 1. Install Firebase CLI
```powershell
npm install -g firebase-tools
```

### 2. Login to Firebase
```powershell
firebase login
```

### 3. Initialize Firebase (if not done)
```powershell
firebase init
```
Select:
- ✅ Firestore
- ✅ Hosting
- ✅ Storage (optional)

### 4. Deploy Firestore Rules & Indexes
```powershell
firebase deploy --only firestore
```

### 5. Deploy to Firebase Hosting (Optional)
```powershell
firebase deploy --only hosting
```

---

## 🌐 Deploy to Vercel (Recommended for Next.js)

### 1. Install Vercel CLI
```powershell
npm install -g vercel
```

### 2. Login to Vercel
```powershell
vercel login
```

### 3. Deploy
```powershell
cd "w:\mymeet'"
vercel --prod
```

### 4. Add Environment Variables in Vercel Dashboard
Go to: https://vercel.com/your-project/settings/environment-variables

Add these:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBB77MsGymDxKH0OD07SArGQim95qMnSH4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=intell-fae56.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=intell-fae56
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=intell-fae56.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=286667291699
NEXT_PUBLIC_FIREBASE_APP_ID=1:286667291699:web:0252ac76e2c18ea3317746
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-2WPSR7038D
```

### 5. Update Google OAuth Authorized Domains
After deploying, add your Vercel domain to:
- Google Cloud Console → OAuth Credentials → Authorized JavaScript origins
- Add: `https://your-app.vercel.app`

---

## 📊 Firebase Configuration for 1000+ Users

### 1. Firestore Optimization

#### Enable Firestore in Production Mode
- Go to: https://console.firebase.google.com/project/intell-fae56/firestore
- If not created, click "Create database"
- Select **Production mode**
- Choose location: `us-central1` (or closest to your users)

#### Create Composite Indexes (Required for Performance)
Already configured in `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "chat",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "doubts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "answered", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "attendees",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "joinedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```powershell
firebase deploy --only firestore:indexes
```

### 2. Authentication Limits

#### Upgrade to Blaze Plan (Required for 1000+ users)
- Go to: https://console.firebase.google.com/project/intell-fae56/usage
- Click "Upgrade to Blaze plan"
- Set budget alerts to avoid unexpected charges

**Free tier limits:**
- Auth: 10K verifications/month (not enough for 1000 users)
- Firestore: 50K reads, 20K writes per day (too low)

**Blaze plan costs (estimated for 1000 students):**
- Auth: ~$0 (10K free, then $0.006/verification)
- Firestore: ~$1-5/month (50K reads free, then $0.06/100K)
- Storage: ~$0.026/GB/month
- Network: ~$0.12/GB

### 3. Security Rules Optimization

The rules in `firestore.rules` are already optimized:
- ✅ Prevent unlimited reads
- ✅ Only authenticated users can access
- ✅ Teachers control room state
- ✅ Students can only create chat/doubts

---

## 🎥 Jitsi Configuration for 1000+ Students

### Using Free Jitsi Meet (Current Setup)
**Pros:**
- ✅ Free
- ✅ No setup needed
- ✅ Works immediately

**Cons:**
- ❌ Limited to ~75 simultaneous video streams
- ❌ No custom branding
- ❌ Shared infrastructure

**Current Configuration (in `jitsi-frame.tsx`):**
```typescript
configOverwrite: {
  startWithAudioMuted: !isTeacher,
  startWithVideoMuted: !isTeacher,
  prejoinPageEnabled: false,
  disableDeepLinking: true,
  enableNoisyMicDetection: false,
  p2p: { enabled: false },
  resolution: 720,
  constraints: {
    video: { height: { ideal: 720, max: 720 } }
  },
  lastN: isTeacher ? 20 : 1,  // Students only see teacher
}
```

### Option 1: Keep Free Jitsi (Easiest)
✅ **Works for 1000+ students in lecture mode**
- Students only receive 1 video stream (teacher)
- Teacher sees up to 20 students
- Total bandwidth per student: ~1-2 Mbps

### Option 2: Self-Hosted Jitsi (Advanced)
For unlimited control and no limits:

```powershell
# Install Docker
# Then run:
docker run -d `
  --name jitsi `
  -p 8443:443 `
  -p 10000:10000/udp `
  -e ENABLE_AUTH=1 `
  -e ENABLE_GUESTS=0 `
  jitsi/jitsi-meet:stable
```

Update `JITSI_DOMAIN` in code to your server.

---

## 🔧 Performance Optimizations

### 1. Enable Next.js Production Optimizations

Already configured in `next.config.mjs`:
```javascript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,  // Faster builds
  compress: true,   // Gzip compression
  images: {
    domains: ['meet.jit.si', 'firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp']
  }
}
```

### 2. Enable CDN for Static Assets

If deploying to Vercel:
- ✅ Automatic CDN
- ✅ Edge caching
- ✅ Global distribution

If deploying elsewhere, use:
- Cloudflare CDN (free)
- AWS CloudFront
- Google Cloud CDN

### 3. Database Connection Pooling

Already handled by Firebase SDK (automatic).

### 4. Implement Rate Limiting

Add to `middleware.ts` (create if doesn't exist):
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map<string, { count: number; resetTime: number }>()

export function middleware(request: NextRequest) {
  const ip = request.ip || 'anonymous'
  const now = Date.now()
  const limit = rateLimit.get(ip)

  if (limit && now < limit.resetTime) {
    if (limit.count > 100) {
      return new NextResponse('Too many requests', { status: 429 })
    }
    limit.count++
  } else {
    rateLimit.set(ip, { count: 1, resetTime: now + 60000 }) // 1 min
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
```

---

## 📈 Monitoring & Analytics

### 1. Firebase Analytics (Free)
Already configured with `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

View analytics:
https://console.firebase.google.com/project/intell-fae56/analytics

### 2. Firebase Performance Monitoring
```powershell
pnpm add firebase
```

Add to `lib/firebase.ts`:
```typescript
import { getPerformance } from 'firebase/performance'
const perf = getPerformance(app)
```

### 3. Error Tracking with Sentry (Optional)
```powershell
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 4. Uptime Monitoring
- Use UptimeRobot (free)
- Ping your app every 5 minutes
- Get alerts if down

---

## 🔒 Security Hardening

### 1. Content Security Policy
Already configured in `next.config.mjs`:
```javascript
headers: async () => [{
  source: '/:path*',
  headers: [
    {
      key: 'Content-Security-Policy',
      value: "frame-src 'self' https://meet.jit.si https://*.jitsi.net"
    }
  ]
}]
```

### 2. Environment Variables
✅ Never commit `.env.local`
✅ Use Vercel environment variables
✅ Rotate secrets regularly

### 3. API Rate Limiting
Add middleware (see Performance section above)

### 4. CORS Configuration
Already handled by Next.js API routes.

---

## 💰 Cost Estimation for 1000 Students

### Scenario: 1 class with 1000 students for 1 hour

**Firebase (Blaze Plan):**
- Firestore reads: ~100K/hour = $0.06
- Firestore writes: ~10K/hour = $0.18
- Auth: 1000 sign-ins = $0
- Storage: 1GB = $0.026/month
- **Total: ~$0.30/hour or ~$7/month for daily 1-hour classes**

**Jitsi (Free meet.jit.si):**
- $0 (free forever)
- Bandwidth: Provided by Jitsi

**Vercel (Pro Plan: $20/month):**
- Includes:
  - Unlimited bandwidth
  - Edge functions
  - Analytics
  - Team features

**Total Monthly Cost:**
- Firebase: ~$7-10
- Vercel: $20 (or $0 on hobby plan)
- **Total: ~$30/month for 1000 students**

---

## 🚀 Deployment Commands Summary

```powershell
# 1. Install everything
cd "w:\mymeet'"
pnpm install

# 2. Build and test locally
pnpm build
pnpm start

# 3. Deploy Firestore rules
firebase login
firebase deploy --only firestore

# 4. Deploy to Vercel
npm install -g vercel
vercel login
vercel --prod

# 5. Add environment variables in Vercel dashboard
# (see section above)
```

---

## ✅ Final Production Checklist

### Firebase
- [ ] Upgraded to Blaze plan
- [ ] Firestore rules deployed
- [ ] Firestore indexes created
- [ ] Google Auth enabled
- [ ] OAuth redirect URIs added
- [ ] Budget alerts set

### Application
- [ ] All dependencies installed (`pnpm install`)
- [ ] Production build successful (`pnpm build`)
- [ ] Environment variables configured
- [ ] Tested locally (`pnpm start`)

### Deployment
- [ ] Deployed to Vercel/hosting
- [ ] Environment variables added to hosting
- [ ] Custom domain configured (optional)
- [ ] SSL certificate enabled (auto on Vercel)
- [ ] Google OAuth updated with production domain

### Testing
- [ ] Teacher can create class
- [ ] 5-10 students can join with code
- [ ] Video works for all users
- [ ] Mode switching works (present/whiteboard/code)
- [ ] Chat messages appear in real-time
- [ ] Doubts submission works
- [ ] Mobile responsive works

### Monitoring
- [ ] Firebase Analytics enabled
- [ ] Performance monitoring set up
- [ ] Error tracking configured
- [ ] Uptime monitoring active

---

## 🎯 Load Testing Before Launch

### Test with 10 Students
```powershell
# Use different browsers/incognito windows
# Create 1 class, join with 10 accounts
# Test all features
```

### Test with 100 Students (Use BrowserStack)
- Create accounts on BrowserStack
- Simulate 100 concurrent users
- Monitor Firebase console for errors

### Test with 1000 Students
- Use load testing tools like:
  - Artillery.io
  - K6
  - JMeter

Example Artillery test:
```yaml
config:
  target: "https://your-app.vercel.app"
  phases:
    - duration: 60
      arrivalRate: 100
scenarios:
  - flow:
      - get:
          url: "/classroom/ABC123"
```

---

## 🆘 Emergency Contacts & Resources

### If Site Goes Down
1. Check Firebase console: https://console.firebase.google.com/project/intell-fae56
2. Check Vercel dashboard: https://vercel.com/dashboard
3. Check Jitsi status: https://status.jitsi.io

### Support Resources
- Firebase Support: https://firebase.google.com/support
- Vercel Support: https://vercel.com/help
- Jitsi Community: https://community.jitsi.org

---

## 🎉 You're Ready for Production!

Run these final commands:

```powershell
cd "w:\mymeet'"
pnpm install
pnpm build
vercel --prod
```

Then test with real users! 🚀

**Estimated setup time: 30 minutes**
**Estimated monthly cost: $30 for 1000 students**
**Uptime: 99.9% (Vercel + Firebase SLA)**
