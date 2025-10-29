# Admin Authentication Migration Summary

Migrated admin panel authentication from phone/code verification to email/password login using a dedicated admin collection.

## Changes Overview

### Backend (Server)

#### New Files Created (7):
1. `/server/src/core/domain/entities/Admin.ts`
   - Admin entity interface with email, password, name, timestamps

2. `/server/src/core/domain/repositories/IAdminRepository.ts`
   - Repository interface for admin operations

3. `/server/src/infrastructure/database/models/AdminModel.ts`
   - MongoDB schema with email (unique), bcrypt password, name, lastLoginAt

4. `/server/src/infrastructure/database/repositories/AdminRepository.ts`
   - Implementation with findByEmail, findById, create, updateLastLogin

5. `/server/src/application/usecases/auth/AdminLoginUseCase.ts`
   - Login logic with bcrypt password verification
   - Generates JWT tokens
   - Updates last login timestamp

6. `/server/src/scripts/seedAdmin.ts`
   - Script to create initial admin user from .env variables

7. `/Users/erfan/nero/ADMIN_AUTH_SETUP.md`
   - Complete setup and usage documentation

#### Modified Files (5):
1. `/server/src/infrastructure/di/container.ts`
   - Added AdminRepository and AdminLoginUseCase to dependency injection

2. `/server/src/presentation/controllers/AuthController.ts`
   - Added adminLogin endpoint handler

3. `/server/src/presentation/routes/authRoutes.ts`
   - Added POST /auth/admin/login route

4. `/server/.env.example`
   - Added ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME

5. `/server/package.json`
   - Added `seed:admin` script command

### Frontend (Panel)

#### Modified Files (4):
1. `/panel/src/services/authService.ts`
   - Replaced phone/code methods with adminLogin
   - Updated response interface to Admin type

2. `/panel/src/stores/useAuthStore.ts`
   - Simplified User interface (id, email, name only)
   - Replaced login/verifyCode with single login(email, password)
   - Removed role checking (all panel users are admins)

3. `/panel/src/pages/Login.tsx`
   - Complete redesign with email/password form
   - Material-style inputs with icons (Mail, Lock)
   - Form validation and error handling
   - Removed phone/code verification flow

4. `/panel/src/components/ProtectedRoute.tsx`
   - Removed role check (admin collection users are all admins)

#### Removed Files (2):
1. `/panel/src/components/auth/PhoneInput.tsx` - No longer needed
2. `/panel/src/components/auth/CodeVerification.tsx` - No longer needed

## Key Differences

### Before (Phone/Code):
- Two-step authentication (phone → code)
- SMS verification via Twilio
- Users collection with role field
- Complex flow with verification code expiry

### After (Email/Password):
- Single-step authentication
- Direct email/password login
- Separate admins collection
- Simple bcrypt password verification

## API Changes

### Removed Endpoints:
- ~~POST /auth/send-code~~
- ~~POST /auth/verify-code~~

### New Endpoint:
- **POST /auth/admin/login**
  - Request: `{ email: string, password: string }`
  - Response: `{ status, data: { admin, accessToken, refreshToken } }`

## Security Improvements

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **Separate Collection**: Admins isolated from regular users
3. **No Self-Registration**: Admins must be seeded/created manually
4. **JWT Tokens**: Access and refresh tokens for authentication
5. **Last Login Tracking**: Audit trail for admin logins

## Setup Required

### 1. Environment Variables
Add to `/server/.env`:
```env
ADMIN_EMAIL=admin@nero.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Admin
```

### 2. Seed Admin User
```bash
cd server
npm run seed:admin
```

### 3. Login
Use the email and password from .env to login to the admin panel.

## Migration Checklist

- [x] Create Admin entity and repository
- [x] Create AdminLoginUseCase with bcrypt verification
- [x] Update AuthController and routes
- [x] Add admin credentials to .env
- [x] Create seed script
- [x] Update panel auth service
- [x] Update panel auth store
- [x] Redesign Login page
- [x] Update ProtectedRoute
- [x] Remove old phone/code components
- [x] Create documentation

## Testing Steps

1. Set admin credentials in server/.env
2. Run `npm run seed:admin` to create admin user
3. Start server: `npm run dev` in server folder
4. Start panel: `npm run dev` in panel folder
5. Navigate to panel login page
6. Enter admin email and password
7. Verify successful login and redirect to dashboard
8. Test protected routes with valid token
9. Test logout functionality

## Notes

- Old phone/code authentication still exists for main app users
- Admin panel now completely separate from user authentication
- Tokens stored in localStorage (panel) and memory (server)
- Consider adding password change functionality in future
- Consider adding admin management page for creating additional admins
