// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDYMfJp4hZe1JACTdqA3uDdWggSZI365GU",
  authDomain: "bulkemail-crm.firebaseapp.com",
  projectId: "bulkemail-crm",
  storageBucket: "bulkemail-crm.firebasestorage.app",
  messagingSenderId: "722774203249",
  appId: "1:722774203249:web:8aa683b0ae55852389f4d0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
