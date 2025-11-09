# 🚀 Complete Setup Commands - Copy & Paste

## Step 1: Start Development Server (30 seconds)

```powershell
cd "w:\mymeet'"
pnpm dev
```

✅ Open http://localhost:3000 in your browser

---

## Step 2: Firebase Setup (5 minutes)

### 2.1 Install Firebase CLI (if not installed)
```powershell
npm install -g firebase-tools
```

### 2.2 Login to Firebase
```powershell
firebase login
```

### 2.3 Deploy Firestore Rules
```powershell
firebase deploy --only firestore
```

---

## Step 3: Firebase Console Setup

### 3.1 Enable Google Authentication
1. Go to: https://console.firebase.google.com/project/intell-fae56/authentication
2. Click "Get started" (if not already enabled)
3. Click "Sign-in method" tab
4. Click "Google" → Enable → Save
5. In "Authorized domains":
   - Add `localhost` (should already be there)
   - Add your production domain when deploying

### 3.2 Create Firestore Database
1. Go to: https://console.firebase.google.com/project/intell-fae56/firestore
2. Click "Create database"
3. Choose "Start in production mode"
4. Select location closest to you (e.g., `us-central1`)
5. Click "Enable"

### 3.3 Verify Rules (Optional)
1. In Firestore, click "Rules" tab
2. Should see your custom rules (from Step 2.3)
3. If not, run: `firebase deploy --only firestore:rules`

---

## Step 4: Test the Application (3 minutes)

### Test as Teacher:
1. Open http://localhost:3000
2. Click "Get Started" or "Login"
3. Sign in with your Google account
4. Select "Teacher" from role dropdown
5. Click "Create Class"
6. **Copy the 6-character code**
7. Click "Start Class"
8. Try switching modes:
   - Click "Present" → "Whiteboard" → "Code"

### Test as Student (Open incognito/different browser):
1. Go to http://localhost:3000/login
2. Sign in with **different** Google account
3. Select "Student" from role dropdown
4. Click "Join Class"
5. **Enter the code from teacher**
6. You should see teacher's screen!

---

## Step 5: Build for Production (when ready)

```powershell
pnpm build
pnpm start
```

Test at: http://localhost:3000

---

## 🎯 Quick Deploy to Vercel

```powershell
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

**After deploying to Vercel:**
1. Copy your Vercel URL (e.g., `your-app.vercel.app`)
2. Go to Firebase Console → Authentication → Settings
3. Add your Vercel domain to "Authorized domains"

---

## ⚡ Super Quick Start (TL;DR)

If you just want to test locally RIGHT NOW:

```powershell
# 1. Start the app
cd "w:\mymeet'"
pnpm dev

# 2. In another terminal - Deploy Firebase rules
firebase login
firebase deploy --only firestore
```

Then:
1. Go to Firebase Console → Enable Auth + Create Firestore
2. Open http://localhost:3000
3. Sign in and test!

---

## 📋 Checklist

Before you start:
- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] Internet connection (for Firebase & Jitsi)

Firebase setup:
- [ ] Firebase CLI installed
- [ ] Logged into Firebase
- [ ] Firestore rules deployed
- [ ] Authentication enabled (Google)
- [ ] Firestore database created
- [ ] localhost added to authorized domains

Testing:
- [ ] Teacher can create class
- [ ] Student can join with code
- [ ] Video works
- [ ] Can switch modes
- [ ] Chat works
- [ ] Doubts work

---

## 🐛 Common Issues & Fixes

### "Firebase: Error (auth/popup-closed-by-user)"
**Fix:** Just click sign in again

### "Permission denied" in Firestore
**Fix:** 
```powershell
firebase deploy --only firestore:rules
```

### "Class not found"
**Fix:** Make sure you're using the exact code (case-sensitive, no spaces)

### Jitsi video not loading
**Fix:** 
- Check internet connection
- Refresh page
- Try different browser
- Check browser console for errors

### Can't deploy Firebase rules
**Fix:**
```powershell
firebase login
firebase use intell-fae56
firebase deploy --only firestore
```

---

## 🎓 What Each File Does

### Configuration
- `.env.local` → Firebase credentials (already set)
- `next.config.mjs` → Next.js config (already configured)
- `firestore.rules` → Database security (deploy with `firebase deploy`)

### Code
- `lib/` → Firebase, Auth, Firestore helpers
- `hooks/` → React hooks for auth, chat, doubts, etc.
- `components/classroom/` → Video, Whiteboard, Code editor
- `app/` → Pages (login, dashboard, classroom)

### Documentation
- `README.md` → Full documentation
- `QUICKSTART.md` → Quick setup guide
- `PROJECT_SUMMARY.md` → What was built
- `FIREBASE_DEPLOY.md` → Firebase deployment guide
- `COMMANDS.md` → This file!

---

## 🎉 You're Ready!

Everything is set up. Just run the commands above and you'll have a working classroom app in minutes.

**Next steps:**
1. Run `pnpm dev`
2. Deploy Firebase rules
3. Test it out!

Happy teaching! 📚✨
