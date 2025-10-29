# Firebase Configuration Guide

This guide explains how to set up Firebase for the Nero application with your provided credentials.

## Quick Start

Your Firebase project has been pre-configured with the following credentials:

```
Project ID: nero-d9eec
Auth Domain: nero-d9eec.firebaseapp.com
Storage Bucket: nero-d9eec.firebasestorage.app
```

## Step 1: Install Firebase Package

```bash
cd /Users/erfan/nero
npm install firebase
```

## Step 2: Configure Environment Variables

Your `.env.example` file already contains the Firebase configuration. Create a `.env` file in the root directory with:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:2000/api/v1
VITE_SERVER_ORIGIN=http://localhost:2000

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyB_xb9MsTagBJY0XmFIgr9H-6Jcz_mPjPw
VITE_FIREBASE_AUTH_DOMAIN=nero-d9eec.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nero-d9eec
VITE_FIREBASE_STORAGE_BUCKET=nero-d9eec.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=448577746795
VITE_FIREBASE_APP_ID=1:448577746795:web:a9368454f2b7864ccefe2e
VITE_FIREBASE_MEASUREMENT_ID=G-TN1ZGWZLQ1
```

## Step 3: Firebase Initialization

Firebase is automatically initialized when the app starts via the `useFirebaseInit()` hook in `App.tsx`.

The hook:
- Loads Firebase configuration from environment variables
- Initializes Firebase app
- Enables Analytics (if measurement ID is provided)
- Handles initialization errors gracefully

## Available Firebase Services

Once Firebase is installed, you can use the following services:

### 1. Authentication
```typescript
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth();
const provider = new GoogleAuthProvider();
// Use for additional auth methods
```

### 2. Cloud Storage
```typescript
import { getStorage, ref, uploadBytes } from 'firebase/storage';

const storage = getStorage();
const storageRef = ref(storage, 'path/to/file');
// Use for file uploads
```

### 3. Firestore Database
```typescript
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const db = getFirestore();
const docRef = await addDoc(collection(db, 'collection'), data);
// Use for real-time database operations
```

### 4. Analytics
```typescript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();
logEvent(analytics, 'page_view');
// Use for tracking user events
```

## File Structure

```
/src/shared/
├── services/
│   └── firebase.ts          # Firebase configuration (when needed)
├── hooks/
│   └── useFirebaseInit.ts   # Firebase initialization hook
└── ...
```

## Usage Examples

### Using Firebase in Components

```typescript
import { useEffect } from 'react';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

export const MyComponent = () => {
  useEffect(() => {
    const uploadFile = async () => {
      const storage = getStorage();
      const fileRef = ref(storage, 'uploads/myfile.jpg');
      
      // Upload file
      const file = new File(['content'], 'myfile.jpg');
      await uploadBytes(fileRef, file);
    };
    
    uploadFile();
  }, []);

  return <div>My Component</div>;
};
```

### Using Firestore

```typescript
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

export const saveData = async (data: any) => {
  const db = getFirestore();
  const docRef = await addDoc(collection(db, 'users'), data);
  return docRef.id;
};

export const getData = async () => {
  const db = getFirestore();
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => doc.data());
};
```

## Security Rules

### Firestore Security Rules

Set these rules in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow public read access to templates
    match /templates/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Security Rules

Set these rules in Firebase Console > Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload files
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow public read access to public files
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Firebase not initializing
- Ensure `npm install firebase` has been run
- Check that all environment variables are set correctly
- Check browser console for error messages

### "Cannot find module 'firebase/app'"
- Run `npm install firebase` in the frontend directory
- Restart the development server

### Authentication errors
- Verify Firebase project settings in Firebase Console
- Check that authentication methods are enabled
- Ensure security rules allow the operations

### Storage upload fails
- Check Firebase Storage security rules
- Verify user is authenticated
- Check file size limits (default 5GB per file)

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyB_xb9MsTagBJY0XmFIgr9H-6Jcz_mPjPw` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Authentication domain | `nero-d9eec.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `nero-d9eec` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket | `nero-d9eec.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender ID | `448577746795` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:448577746795:web:a9368454f2b7864ccefe2e` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics ID | `G-TN1ZGWZLQ1` |

## Next Steps

1. **Install Firebase**: `npm install firebase`
2. **Restart dev server**: `npm run dev`
3. **Check console**: Verify Firebase initializes without errors
4. **Enable services**: In Firebase Console, enable the services you need:
   - Authentication
   - Firestore Database
   - Cloud Storage
   - Cloud Messaging (optional)

## Production Deployment

When deploying to production:

1. Update Firebase security rules for production
2. Enable additional authentication methods if needed
3. Set up Firebase Hosting (optional)
4. Configure CORS for your domain
5. Monitor Firebase usage in Console

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## Support

For issues or questions:
1. Check Firebase Console for errors
2. Review browser console logs
3. Verify environment variables are set
4. Check Firebase documentation
5. Review security rules configuration
