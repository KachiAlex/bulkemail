// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Read Firebase config from environment variables (Vite: VITE_*)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Only initialize Firebase when an API key is provided (prevents invalid-api-key at runtime)
const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 0);

if (hasFirebaseConfig) {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize services
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  export const storage = getStorage(app);
  export const functions = getFunctions(app);

  export default app;
} else {
  // Export safe no-op shims so the frontend can run against backend JWT APIs during migration.
  console.warn('Firebase not configured — running in backend-only mode');

  // Minimal shim implementations used by the app to avoid runtime errors.
  // These do NOT provide Firebase functionality — they are placeholders until Firebase is removed.
  export const auth: any = { currentUser: null };
  export const db: any = {};
  export const storage: any = {};
  export const functions: any = {};

  export default null;
}
