// Quick Start Guide for EduMeet

## Step 1: Firebase Setup (5 minutes)

1. Go to https://console.firebase.google.com/project/intell-fae56

2. **Enable Authentication:**
   - Click "Authentication" → "Get started"
   - Click "Sign-in method" tab
   - Enable "Google" provider
   - Add `localhost` to authorized domains

3. **Create Firestore Database:**
   - Click "Firestore Database" → "Create database"
   - Choose "Start in production mode"
   - Select your preferred location
   - Click "Enable"

4. **Deploy Security Rules:**
   - In Firestore, click "Rules" tab
   - Copy the rules from `firestore.rules` file in this project
   - Click "Publish"

5. **Enable Storage (Optional):**
   - Click "Storage" → "Get started"
   - Use default rules for now

## Step 2: Run the App (1 minute)

```bash
cd "w:\mymeet'"
pnpm dev
```

Open http://localhost:3000

## Step 3: Test the Flow (3 minutes)

### As Teacher:
1. Go to http://localhost:3000/login
2. Sign in with Google
3. Select "Teacher" role from dropdown
4. Click "Create Class"
5. Copy the 6-character code
6. Click "Start Class"

### As Student (in incognito/different browser):
1. Go to http://localhost:3000/login
2. Sign in with different Google account
3. Select "Student" role
4. Click "Join Class"
5. Enter the code from teacher
6. You'll see teacher's view!

## Features to Test:

### Teacher Controls:
- **Present Mode**: Default video mode
  - Click "Share Screen" to share your screen
- **Whiteboard Mode**: Click "Whiteboard" button
  - Draw and annotate
  - Students see your drawing in real-time
- **Code Mode**: Click "Code" button
  - Write code with syntax highlighting
  - Students see your code in real-time (read-only)

### Teacher Sidebar:
- **Students Tab**: See all attendees
- **Chat Tab**: Send messages to all students
- **Doubts Tab**: See student questions, mark as answered

### Student View:
- Automatically follows teacher's mode
- Click "Ask Doubt" to submit questions
- See live student count

## Common Issues & Fixes:

### "Firebase: Error (auth/popup-closed-by-user)"
- **Fix**: Just try signing in again

### "Class not found"
- **Fix**: Make sure you're using the exact code (case-sensitive)

### Jitsi not loading
- **Fix**: Check your internet connection, refresh page

### Firestore permission denied
- **Fix**: Make sure you deployed the security rules (Step 1.4)

### Students can't see teacher's screen
- **Fix**: In Jitsi, allow screen sharing permissions in browser

## Production Deployment:

### Vercel (Recommended):
```bash
pnpm add -g vercel
vercel
```

### Add these domains to Firebase:
1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain to "Authorized domains"

## Architecture Overview:

```
Frontend (Next.js)
├── Authentication: Firebase Auth (Google OAuth)
├── Database: Firestore (realtime sync)
├── Video: Jitsi Meet (iframe API)
├── Whiteboard: Excalidraw
└── Code Editor: Monaco Editor

Data Flow:
1. Teacher changes mode → writes to Firestore
2. Firestore triggers realtime listener
3. All students get update instantly
4. Student UI switches to match teacher
```

## Scaling to 1000+ Students:

The app is already configured for lecture mode:
- Students join with audio/video muted
- Students only see teacher (lastN: 1)
- No video upload from students
- Minimal bandwidth per student
- Firestore handles 1M concurrent connections

## Support:

- Check `README.md` for detailed documentation
- Review browser console for errors
- Check Firebase Console for Firestore/Auth issues
- Test Firestore rules using Firebase Emulator

---

That's it! You now have a fully functional online classroom platform. 🎉
