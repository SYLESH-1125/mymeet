# 🔧 Troubleshooting Guide

## ❌ Error: "Firebase: Error (auth/cancelled-popup-request)"

This error appears when:
1. The Google sign-in popup was closed before completing
2. Google Authentication is not properly configured in Firebase
3. OAuth credentials are not set up correctly

---

## ✅ Step-by-Step Fix

### 1. Enable Google Authentication in Firebase Console

**Go to Firebase Authentication:**
https://console.firebase.google.com/project/intell-fae56/authentication/providers

**Steps:**
1. Click **"Get started"** (if Authentication is not enabled)
2. Click **"Sign-in method"** tab
3. Find **"Google"** in the providers list
4. Click on **Google**
5. Toggle the switch to **Enable**
6. The **Web SDK configuration** should show:
   - Web client ID: (auto-filled)
   - Web client secret: (auto-filled)
7. Click **"Save"**

### 2. Verify Authorized Domains

In the same Authentication → Settings → Authorized domains:

Make sure these domains are listed:
- ✅ `localhost` (should be there by default)
- ✅ `intell-fae56.firebaseapp.com` (your Firebase domain)

If `localhost` is missing, click **"Add domain"** and add it.

### 3. Update Google OAuth Consent Screen

**Go to Google Cloud Console:**
https://console.cloud.google.com/apis/credentials?project=micro-spanner-477007

**Check OAuth 2.0 Client IDs:**
1. Find your client: `541690467633-4mcuhtt7nkg7b5r258frhk8ct5qr8fph.apps.googleusercontent.com`
2. Click "Edit" (pencil icon)
3. Verify **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost
   https://intell-fae56.firebaseapp.com
   ```
4. Verify **Authorized redirect URIs**:
   ```
   https://intell-fae56.firebaseapp.com/__/auth/handler
   ```
5. Click **"Save"**
6. **Wait 5-10 minutes** for changes to propagate

### 4. Create Firestore Database (If Not Created)

**Go to Firestore:**
https://console.firebase.google.com/project/intell-fae56/firestore

**Steps:**
1. Click **"Create database"**
2. Select **"Start in production mode"**
3. Choose location: **us-central1** (or closest to you)
4. Click **"Enable"**

### 5. Deploy Firestore Security Rules

**In your terminal:**
```powershell
cd "w:\mymeet'"
firebase login
firebase deploy --only firestore
```

This will deploy:
- Security rules from `firestore.rules`
- Indexes from `firestore.indexes.json`

---

## 🧪 Testing After Setup

### Test 1: Check if Firebase is initialized
Open browser console (F12) and run:
```javascript
console.log('Firebase config:', {
  apiKey: import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
});
```

### Test 2: Try signing in
1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Google popup should appear
4. Select your account
5. Should redirect to dashboard

### Test 3: Check user profile
After signing in, open console and run:
```javascript
// Check Firebase auth
firebase.auth().currentUser
```

---

## 🔍 Common Errors & Solutions

### Error: "auth/internal-error"
**Cause:** Content Security Policy blocking Google scripts
**Solution:** Already fixed in `next.config.mjs` - CSP allows Google domains

### Error: "auth/popup-closed-by-user"
**Cause:** User closed the popup before completing sign-in
**Solution:** Normal behavior - user just needs to try again

### Error: "auth/unauthorized-domain"
**Cause:** `localhost` not in authorized domains
**Solution:** Add `localhost` in Firebase Console → Authentication → Settings → Authorized domains

### Error: "auth/cancelled-popup-request"
**Cause 1:** Clicked sign-in button multiple times quickly
**Solution:** Wait for first popup to complete

**Cause 2:** Google Auth not enabled in Firebase
**Solution:** Follow Step 1 above to enable it

### Error: "Permission denied" when creating class
**Cause:** Firestore rules not deployed
**Solution:** Run `firebase deploy --only firestore`

---

## 📋 Complete Setup Checklist

Before testing, verify ALL of these:

### Firebase Console (console.firebase.google.com)
- [ ] Authentication enabled
- [ ] Google sign-in method enabled
- [ ] `localhost` in authorized domains
- [ ] Firestore database created
- [ ] Firestore rules deployed

### Google Cloud Console (console.cloud.google.com)
- [ ] OAuth client created
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added
- [ ] Waited 5-10 minutes after saving

### Local Environment
- [ ] `.env.local` file exists with correct values
- [ ] `pnpm install` completed successfully
- [ ] `pnpm dev` running on http://localhost:3000
- [ ] No errors in terminal
- [ ] Browser console clear (no red errors)

---

## 🆘 Still Not Working?

### Check Firebase Project Settings
```powershell
# Verify your Firebase project
firebase projects:list

# Should show: intell-fae56
```

### Check Environment Variables
```powershell
cat .env.local
```

Should show:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBB77MsGymDxKH0OD07SArGQim95qMnSH4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=intell-fae56.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=intell-fae56
...
```

### Check Browser Console Errors
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for red errors
4. Copy and check against errors above

### Test in Incognito Mode
Sometimes browser extensions block popups:
1. Open Chrome Incognito (Ctrl+Shift+N)
2. Go to http://localhost:3000
3. Try signing in

---

## ✅ Success Indicators

You know it's working when:
1. ✅ Google popup opens when clicking "Sign in with Google"
2. ✅ Can select Google account
3. ✅ Popup closes automatically after selecting account
4. ✅ Redirects to `/dashboard`
5. ✅ Shows your name and profile picture
6. ✅ Shows "Teacher" or "Student" role
7. ✅ No red errors in console

---

## 🎯 Quick Test Command

Run this in browser console after signing in:
```javascript
// Should show your user data
firebase.auth().currentUser?.email

// Should show your role
firebase.firestore()
  .collection('users')
  .doc(firebase.auth().currentUser?.uid)
  .get()
  .then(doc => console.log('Role:', doc.data()?.role))
```

---

## 📞 Need More Help?

If still stuck, provide:
1. Full browser console errors (F12 → Console)
2. Screenshot of Firebase Authentication page
3. Screenshot of Google Cloud OAuth credentials page
4. Output of `firebase projects:list`

This will help debug the specific issue!
