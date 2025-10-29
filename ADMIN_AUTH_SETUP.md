# Admin Panel Authentication Setup

The admin panel now uses email/password authentication with credentials stored in the admin collection.

## Backend Changes

### New Files Created:
1. `/server/src/core/domain/entities/Admin.ts` - Admin entity
2. `/server/src/core/domain/repositories/IAdminRepository.ts` - Admin repository interface
3. `/server/src/infrastructure/database/models/AdminModel.ts` - MongoDB schema for admins
4. `/server/src/infrastructure/database/repositories/AdminRepository.ts` - Admin repository implementation
5. `/server/src/application/usecases/auth/AdminLoginUseCase.ts` - Login use case with bcrypt password verification
6. `/server/src/scripts/seedAdmin.ts` - Seed script to create initial admin user

### Modified Files:
- `/server/src/infrastructure/di/container.ts` - Added AdminRepository and AdminLoginUseCase
- `/server/src/presentation/controllers/AuthController.ts` - Added adminLogin endpoint
- `/server/src/presentation/routes/authRoutes.ts` - Added POST /auth/admin/login route
- `/server/.env.example` - Added admin credentials
- `/server/package.json` - Added seed:admin script

### API Endpoint:
- **POST** `/api/v1/auth/admin/login`
  - Body: `{ email: string, password: string }`
  - Response: `{ status, data: { admin, accessToken, refreshToken } }`

## Panel Changes

### Modified Files:
- `/panel/src/services/authService.ts` - Replaced phone/code methods with adminLogin
- `/panel/src/stores/useAuthStore.ts` - Updated to use email/password login
- `/panel/src/pages/Login.tsx` - Complete redesign with email/password form

## Setup Instructions

### 1. Configure Environment Variables

Add to `/server/.env`:
```env
ADMIN_EMAIL=admin@nero.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Admin
```

### 2. Seed Admin User

Run the seed script to create the initial admin user:
```bash
cd server
npm run seed:admin
```

This will:
- Connect to MongoDB
- Check if admin already exists
- Create admin with hashed password
- Display credentials in console

### 3. Start Servers

Start backend:
```bash
cd server
npm run dev
```

Start panel:
```bash
cd panel
npm run dev
```

### 4. Login to Panel

Navigate to the panel and login with:
- Email: Value from `ADMIN_EMAIL`
- Password: Value from `ADMIN_PASSWORD`

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens for authentication
- Email stored in lowercase
- Last login timestamp tracking
- Protected routes require valid JWT

## Database Schema

```typescript
{
  email: string;      // Unique, lowercase
  password: string;   // Bcrypt hashed
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
```

## Notes

- The admin collection is separate from the user collection
- Admins can only be created via the seed script or database directly
- Change default password after first login
- Tokens stored in localStorage (panel only)
- No self-registration for admins
