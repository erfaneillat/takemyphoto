# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Nero application.

## Prerequisites

- Google Cloud Console account
- Node.js and npm installed
- MongoDB database running

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure the OAuth consent screen if you haven't already:
   - User Type: External (for testing) or Internal (for organization)
   - App name: Nero
   - User support email: your email
   - Developer contact: your email
6. Select **Application type**: Web application
7. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (for development)
   - Your production URL (when deploying)
8. Add **Authorized redirect URIs**:
   - `http://localhost:5173` (for development)
   - Your production URL (when deploying)
9. Click **Create**
10. Copy the **Client ID** (you'll need this)

## Step 2: Configure Environment Variables

### Frontend (.env file in /Users/erfan/nero)

Create a `.env` file in the root directory if it doesn't exist, and add:

```env
VITE_API_BASE_URL=http://localhost:2000/api/v1
VITE_SERVER_ORIGIN=http://localhost:2000
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

Replace `your-google-client-id-here` with the Client ID you copied from Google Cloud Console.

### Backend (.env file in /Users/erfan/nero/server)

Ensure your backend `.env` file has:

```env
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
MONGODB_URI=mongodb://localhost:27017/nero
PORT=2000
```

## Step 3: Update MongoDB

The User schema has been updated to support Google OAuth. If you have existing users, no migration is needed as the new fields are optional.

### New User Fields:
- `googleId` (string, optional, unique)
- `profilePicture` (string, optional)
- `phoneNumber` is now optional (to support Google-only users)

## Step 4: Start the Application

### Start Backend:
```bash
cd /Users/erfan/nero/server
npm run dev
```

### Start Frontend:
```bash
cd /Users/erfan/nero
npm run dev
```

## Step 5: Test Google OAuth Login

1. Open your browser and navigate to `http://localhost:5173/login`
2. Click the **Sign in with Google** button
3. Select your Google account
4. Grant permissions when prompted
5. You should be redirected to the home page after successful authentication

## How It Works

### Authentication Flow:

1. **User clicks "Sign in with Google"**
   - Google OAuth popup opens
   - User selects their Google account and grants permissions

2. **Google returns a credential (JWT)**
   - The JWT contains user info (sub, email, name, picture)
   - Frontend decodes the JWT to extract user data

3. **Frontend sends user data to backend**
   - POST `/api/v1/auth/google`
   - Includes: googleId, email, name, profilePicture

4. **Backend processes the login**
   - Checks if user exists by `googleId`
   - If not found, checks by `email` (links existing account)
   - Creates new user if not found
   - Generates JWT access and refresh tokens

5. **Frontend stores tokens**
   - Stores in localStorage
   - Updates auth state in Zustand store
   - Redirects to home page

### Backend Endpoints:

- `POST /api/v1/auth/google` - Google OAuth login
- Existing phone/code endpoints remain functional

### Frontend Components:

- `LoginPage.tsx` - Main login page with Google OAuth button
- `useAuthStore.ts` - Zustand store with `googleLogin()` method
- `authService.ts` - API service with `googleLogin()` function

## Security Considerations

1. **Client ID**: The Google Client ID is public and safe to include in frontend code
2. **Tokens**: JWT tokens are stored in localStorage (consider httpOnly cookies for production)
3. **HTTPS**: Use HTTPS in production to protect tokens in transit
4. **CORS**: Configure CORS properly in your backend
5. **OAuth Consent Screen**: Complete all required fields for production

## Troubleshooting

### "Cannot find module '@react-oauth/google'"
Run: `npm install @react-oauth/google` in the frontend directory

### Google OAuth popup doesn't open
- Check that `VITE_GOOGLE_CLIENT_ID` is set correctly
- Verify the Client ID matches your Google Cloud Console
- Check browser console for errors

### Login fails with 401 error
- Ensure backend is running on port 2000
- Check that `VITE_API_BASE_URL` points to correct backend URL
- Verify MongoDB is running and connected

### "Invalid Google Client ID"
- Double-check the Client ID in `.env` file
- Ensure there are no extra spaces or quotes around the ID
- Verify the Client ID is for a Web application type

## Production Deployment

When deploying to production:

1. Update **Authorized JavaScript origins** in Google Cloud Console
2. Update **Authorized redirect URIs** in Google Cloud Console
3. Set production `VITE_GOOGLE_CLIENT_ID` in your hosting platform
4. Use environment variables for sensitive data
5. Enable HTTPS
6. Complete OAuth consent screen verification (if needed)

## Additional Features

### User Profile Display
The user's Google profile picture is now available in the `User` object:
```typescript
const { user } = useAuthStore();
if (user?.profilePicture) {
  // Display profile picture
}
```

### Check Authentication Method
```typescript
const { user } = useAuthStore();
if (user?.googleId) {
  // User logged in with Google
} else if (user?.phoneNumber) {
  // User logged in with phone
}
```

## Support

If you encounter any issues, please check:
- Google Cloud Console configuration
- Environment variables are set correctly
- Backend and frontend are running
- MongoDB is connected
- Browser console for error messages
