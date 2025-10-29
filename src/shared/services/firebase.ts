/**
 * Firebase Configuration and Services
 * 
 * This file initializes Firebase and exports all services.
 * 
 * Note: Firebase package must be installed first:
 * npm install firebase
 * 
 * Usage:
 * import { auth, storage, db } from '@/shared/services/firebase';
 */

let app: any;
let analytics: any;
let auth: any;
let storage: any;
let db: any;

// Lazy initialization of Firebase
const initializeFirebase = async () => {
  if (app) return { app, analytics, auth, storage, db };

  try {
    const { initializeApp: initApp } = await import('firebase/app');
    const { getAnalytics } = await import('firebase/analytics');
    const { getAuth } = await import('firebase/auth');
    const { getStorage } = await import('firebase/storage');
    const { getFirestore } = await import('firebase/firestore');

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };

    // Initialize Firebase
    app = initApp(firebaseConfig);

    // Initialize Firebase services
    if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
      analytics = getAnalytics(app);
    }
    auth = getAuth(app);
    storage = getStorage(app);
    db = getFirestore(app);

    console.log('[Firebase] Initialized successfully');
    return { app, analytics, auth, storage, db };
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
    throw error;
  }
};

// Export initialization function and services
export { initializeFirebase };
export { app, analytics, auth, storage, db };
