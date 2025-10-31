# 🔥 Firebase Setup Guide

## **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name: `bulkemail-crm`
4. Enable Google Analytics (optional)
5. Click "Create project"

## **Step 2: Enable Authentication**

1. In Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password"
3. Click "Save"

## **Step 3: Create Firestore Database**

1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select location (choose closest to you)
5. Click "Done"

## **Step 4: Get Configuration**

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>)
4. Register app: `bulkemail-crm`
5. Copy the config object

## **Step 5: Update Frontend Config**

Replace the config in `frontend/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "bulkemail-crm.firebaseapp.com",
  projectId: "bulkemail-crm",
  storageBucket: "bulkemail-crm.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## **Step 6: Install Firebase SDK**

```bash
cd frontend
npm install firebase
```

## **Step 7: Update Package.json**

Add Firebase scripts to `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "firebase:deploy": "firebase deploy"
  }
}
```

## **Step 8: Firestore Security Rules**

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /contacts/{contactId} {
      allow read, write: if request.auth != null && 
        resource.data.ownerId == request.auth.uid;
    }
    
    match /campaigns/{campaignId} {
      allow read, write: if request.auth != null && 
        resource.data.createdById == request.auth.uid;
    }
  }
}
```

## **Step 9: Test Authentication**

1. Start frontend: `npm run dev`
2. Go to http://localhost:5173
3. Try registering a new account
4. Check Firebase Console → Authentication → Users

## **Benefits of Firebase:**

✅ **No backend setup** - Firebase handles everything
✅ **Real-time updates** - Data syncs instantly
✅ **Automatic scaling** - Handles millions of users
✅ **Built-in security** - Authentication & authorization
✅ **Free tier** - 50K reads/writes per day
✅ **Cloud functions** - For AI processing
✅ **File storage** - For recordings, CSV files
✅ **Analytics** - Built-in user tracking

## **Next Steps:**

1. Set up Firebase project
2. Update config
3. Install dependencies
4. Test authentication
5. Deploy to Firebase Hosting (optional)

This eliminates all backend complexity and gets you running immediately!
