import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

// Auth service using Firebase Auth
export const authService = {
  // Register new user
  async register(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        createdAt: new Date(),
        role: 'sales_rep'
      });
      
      return {
        user: {
          id: user.uid,
          email: user.email,
          ...userData
        },
        accessToken: await user.getIdToken()
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      return {
        user: {
          id: user.uid,
          email: user.email,
          ...userData
        },
        accessToken: await user.getIdToken()
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Logout user
  async logout() {
    await signOut(auth);
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};
