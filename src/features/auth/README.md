# Authentication Feature

## Overview
This authentication feature implements phone number-based login with SMS verification code.

## Architecture
Following clean architecture principles:
- **Domain Layer**: User entity and auth types in `/core/domain/entities/User.ts`
- **State Management**: Zustand store in `/shared/stores/useAuthStore.ts`
- **UI Components**: React components in `/features/auth/components/`
- **Pages**: Login page in `/features/auth/pages/LoginPage.tsx`

## Flow
1. **Phone Input**: User enters their phone number
2. **Code Verification**: User receives a 6-digit code and enters it
3. **Authentication**: Upon successful verification, user is logged in and redirected

## Components

### PhoneInput
- Validates phone number format
- Handles phone number formatting
- Displays error messages
- Loading state during API calls

### CodeVerification
- 6-digit code input with auto-focus
- Auto-submit when all digits are entered
- Paste support for verification codes
- Resend code with 60-second timer
- Back button to change phone number

### LoginPage
- Main authentication page
- Manages authentication flow between phone and verification steps
- Handles errors and loading states
- Redirects to home after successful login

## State Management (Zustand)

### Auth Store
```typescript
{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (phoneNumber: string) => Promise<void>;
  verifyCode: (phoneNumber: string, code: string) => Promise<void>;
  logout: () => void;
}
```

## Protected Routes
- All main app routes are protected and require authentication
- Unauthenticated users are redirected to `/login`
- Authenticated users trying to access `/login` are redirected to home

## Mock Implementation
Currently uses mock API functions. To integrate with real backend:

1. Replace `mockSendVerificationCode` in `useAuthStore.ts` with actual API call
2. Replace `mockVerifyCode` in `useAuthStore.ts` with actual API call
3. Update error handling based on your API responses

## Testing
For testing purposes, use verification code: `123456`

## Translations
All text is internationalized and supports:
- English (en)
- Persian/Farsi (fa)

Translation keys are in:
- `/shared/translations/en.json` under `auth.*`
- `/shared/translations/fa.json` under `auth.*`

## Styling
- Uses Tailwind CSS
- Supports dark mode
- Responsive design for mobile and desktop
- Smooth animations and transitions
