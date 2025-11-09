# Firebase Deployment Guide

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project: `intell-fae56`

## Steps

### 1. Login to Firebase
```bash
firebase login
```

### 2. Initialize Firebase (if not already done)
```bash
firebase init
```

Select:
- Firestore
- Choose existing project: `intell-fae56`
- Use `firestore.rules` and `firestore.indexes.json`

### 3. Deploy Firestore Rules & Indexes
```bash
firebase deploy --only firestore
```

This will:
- Deploy security rules from `firestore.rules`
- Create indexes from `firestore.indexes.json`

### 4. Verify Deployment

Go to Firebase Console:
- Check Firestore Rules tab - should see your custom rules
- Check Indexes tab - should see chat and doubts indexes

## Quick Deploy Command
```bash
firebase deploy --only firestore
```

## Firestore Rules Summary

The deployed rules ensure:
- ✅ Users can only edit their own profile
- ✅ Only authenticated users can access classes
- ✅ Only teachers can modify room state
- ✅ Only teachers can edit code
- ✅ Students can create chat messages and doubts
- ✅ Teachers can update doubt status

## Indexes Summary

Two composite indexes are created:
1. **chat** - Ordered by timestamp (ascending) for message history
2. **doubts** - Ordered by timestamp (descending) for recent-first display

## Troubleshooting

### "Permission Denied" errors
- Make sure rules are deployed: `firebase deploy --only firestore`
- Check if user is authenticated
- Verify the rule matches your use case

### Index errors
- Deploy indexes: `firebase deploy --only firestore:indexes`
- Wait 2-3 minutes for indexes to build
- Check Firebase Console > Firestore > Indexes tab

### Auth errors
- Verify Google OAuth is enabled in Authentication
- Check authorized domains include your deployment URL

## Testing Rules Locally

```bash
# Install emulator
firebase emulators:start

# In another terminal
pnpm dev
```

Change Firebase config to use emulator:
```typescript
// lib/firebase.ts
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```
