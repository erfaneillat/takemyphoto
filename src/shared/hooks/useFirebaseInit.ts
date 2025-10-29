import { useEffect } from 'react';

/**
 * Hook to initialize Firebase on app load
 * Loads Firebase configuration from environment variables
 * 
 * Note: Firebase package must be installed first:
 * npm install firebase
 */
export const useFirebaseInit = () => {
  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Dynamically import Firebase only when needed
        const { initializeApp } = await import('firebase/app');
        const { getAnalytics } = await import('firebase/analytics');

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
        const app = initializeApp(firebaseConfig);
        
        // Initialize Analytics if measurement ID is provided
        if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
          getAnalytics(app);
        }

        console.log('[Firebase] Initialized successfully');
      } catch (error) {
        console.error('[Firebase] Initialization failed:', error);
      }
    };

    initFirebase();
  }, []);
};
