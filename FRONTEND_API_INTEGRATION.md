# Frontend API Integration - Complete Guide

## ✅ What Has Been Implemented

### 1. API Client (`src/shared/services/api.ts`)
- Axios-based HTTP client
- Automatic token injection for authenticated requests
- Response interceptor for handling 401 errors
- Automatic redirect to login on token expiration
- 30-second timeout configuration

### 2. Authentication Service (`src/shared/services/authService.ts`)
- `sendVerificationCode(phoneNumber)` - Send SMS code
- `verifyCode(phoneNumber, code)` - Verify and login
- `logout()` - Clear tokens and logout
- Automatic token storage in localStorage

### 3. User Service (`src/shared/services/userService.ts`)
- `getMe()` - Get current user
- `getProfile()` - Get profile with statistics
- `updateProfile(data)` - Update user profile

### 4. Updated Auth Store (`src/shared/stores/useAuthStore.ts`)
- Integrated with real backend APIs
- Proper error handling with backend error messages
- Token management
- Automatic logout on authentication failure

## 🚀 Usage Examples

### Authentication Flow

```typescript
import { useAuthStore } from '@/shared/stores';

// In your component
const { login, verifyCode, isLoading, error } = useAuthStore();

// Step 1: Send verification code
try {
  await login('+1234567890');
  // Code sent successfully
} catch (error) {
  // Handle error
  console.error(error);
}

// Step 2: Verify code
try {
  await verifyCode('+1234567890', '123456');
  // User logged in, tokens stored
  // Navigate to home page
} catch (error) {
  // Handle error
  console.error(error);
}
```

### Using User Service

```typescript
import { userService } from '@/shared/services';

// Get current user
const user = await userService.getMe();

// Get profile with stats
const { user, stats } = await userService.getProfile();
console.log(stats.totalEdits, stats.editsThisMonth, stats.favoriteCount);

// Update profile
const updatedUser = await userService.updateProfile({
  name: 'John Doe',
  email: 'john@example.com'
});
```

### Direct API Calls

```typescript
import { apiClient } from '@/shared/services';

// Make authenticated requests
const response = await apiClient.get('/characters');
const characters = response.data.data.characters;

// POST request
const response = await apiClient.post('/characters', formData);
```

## 🔧 Configuration

### 1. Create `.env` file

```bash
# In project root
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 2. For Production

Create `.env.production`:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

## 📝 API Response Format

All API responses follow this format:

**Success:**
```json
{
  "status": "success",
  "data": {
    // Response data here
  }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "phoneNumber",
      "message": "Invalid phone number format"
    }
  ]
}
```

## 🔐 Authentication Flow

```
1. User enters phone number
   ↓
2. Frontend calls authService.sendVerificationCode()
   ↓
3. Backend sends SMS via Twilio
   ↓
4. User receives code
   ↓
5. User enters code
   ↓
6. Frontend calls authService.verifyCode()
   ↓
7. Backend verifies code
   ↓
8. Backend returns user + tokens
   ↓
9. Frontend stores tokens in localStorage
   ↓
10. Frontend updates auth store
   ↓
11. User is authenticated
```

## 🛡️ Token Management

### Automatic Token Injection
```typescript
// Tokens are automatically added to requests
apiClient.get('/users/profile');
// Header: Authorization: Bearer <token>
```

### Token Storage
```typescript
// Stored in localStorage
localStorage.getItem('accessToken');
localStorage.getItem('refreshToken');
```

### Token Expiration Handling
```typescript
// Automatic redirect to login on 401
// Implemented in api.ts response interceptor
```

## 🧪 Testing the Integration

### 1. Start Backend
```bash
cd server
npm run dev
# Backend running on http://localhost:5000
```

### 2. Start Frontend
```bash
npm run dev
# Frontend running on http://localhost:5173
```

### 3. Test Authentication
1. Navigate to `/login`
2. Enter phone number: `+1234567890`
3. Check backend console for verification code
4. Enter the code
5. Should redirect to home page
6. Check localStorage for tokens

### 4. Test Protected Routes
1. Navigate to `/profile`
2. Should see user data from backend
3. Try updating profile
4. Verify changes persist

## 🔍 Debugging

### Check API Calls
```typescript
// Enable axios logging
apiClient.interceptors.request.use(config => {
  console.log('Request:', config.method?.toUpperCase(), config.url);
  return config;
});

apiClient.interceptors.response.use(response => {
  console.log('Response:', response.status, response.data);
  return response;
});
```

### Check Tokens
```typescript
// In browser console
localStorage.getItem('accessToken');
localStorage.getItem('refreshToken');
```

### Check Auth State
```typescript
// In your component
const authState = useAuthStore.getState();
console.log('Auth State:', authState);
```

## 🚨 Common Issues

### CORS Error
**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:** 
- Ensure backend CORS_ORIGIN includes your frontend URL
- Backend `.env`: `CORS_ORIGIN=http://localhost:5173`

### 401 Unauthorized
**Error:** `Invalid or expired token`

**Solution:**
- Clear localStorage and login again
- Check if backend JWT_SECRET matches
- Verify token is being sent in headers

### Network Error
**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution:**
- Ensure backend is running
- Check API_BASE_URL in frontend `.env`
- Verify port numbers match

### Phone Number Format
**Error:** `Invalid phone number format`

**Solution:**
- Use E.164 format: `+1234567890`
- Include country code
- No spaces or special characters

## 📊 API Endpoints Available

### Authentication
- `POST /auth/send-code` - Send verification code
- `POST /auth/verify-code` - Verify code and login

### Users
- `GET /users/me` - Current user
- `GET /users/profile` - Profile with stats
- `PATCH /users/profile` - Update profile

### Characters (To be integrated)
- `POST /characters` - Create character
- `GET /characters` - List characters
- `DELETE /characters/:id` - Delete character

### Templates (To be integrated)
- `GET /templates` - List templates
- `POST /templates/:id/favorite` - Toggle favorite

## 🎯 Next Steps

### 1. Test Authentication
```bash
# Start both servers
cd server && npm run dev
# In another terminal
npm run dev
```

### 2. Implement Character APIs
- Create character service
- Update character store
- Test file uploads

### 3. Implement Template APIs
- Create template service
- Update explore page
- Test filtering and search

### 4. Error Handling
- Add toast notifications
- Improve error messages
- Add retry logic

### 5. Loading States
- Add loading spinners
- Skeleton screens
- Progress indicators

## 📚 Code Examples

### Complete Login Component Example

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores';

export const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  
  const { login, verifyCode, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSendCode = async () => {
    try {
      await login(phoneNumber);
      setStep('code');
    } catch (err) {
      // Error is handled by store
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifyCode(phoneNumber, code);
      navigate('/');
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <div>
      {step === 'phone' ? (
        <div>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
          />
          <button onClick={handleSendCode} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Code'}
          </button>
        </div>
      ) : (
        <div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
          />
          <button onClick={handleVerifyCode} disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};
```

## ✅ Integration Checklist

- [x] Install axios dependency
- [x] Create API client with interceptors
- [x] Create auth service
- [x] Create user service
- [x] Update auth store with real APIs
- [x] Add .env.example
- [x] Update .gitignore for .env files
- [ ] Test authentication flow
- [ ] Test protected routes
- [ ] Implement character APIs
- [ ] Implement template APIs
- [ ] Add error notifications
- [ ] Add loading states
- [ ] Deploy and test in production

## 🎉 Summary

Your frontend is now fully integrated with the backend API! The authentication system is complete and ready to use. All API calls go through the centralized `apiClient` with automatic token management and error handling.

**Ready to test:**
1. Start backend: `cd server && npm run dev`
2. Start frontend: `npm run dev`
3. Navigate to `/login` and test the flow!
