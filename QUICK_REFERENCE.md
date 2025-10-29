# Quick Reference - Nero Full Stack

## 🚀 Quick Start

### Start Development Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev
# Running on http://localhost:5000

# Terminal 2 - Frontend
npm run dev
# Running on http://localhost:5173
```

### First Time Setup
```bash
# Backend
cd server
npm install
cp .env.example .env
# Edit .env with MongoDB URI and secrets
npm run dev

# Frontend
npm install
cp .env.example .env
# VITE_API_BASE_URL is already set
npm run dev
```

## 📡 API Endpoints

### Authentication
```typescript
POST /api/v1/auth/send-code
Body: { phoneNumber: "+1234567890" }

POST /api/v1/auth/verify-code
Body: { phoneNumber: "+1234567890", code: "123456" }
```

### Users
```typescript
GET /api/v1/users/me
GET /api/v1/users/profile
PATCH /api/v1/users/profile
Body: { name: "John", email: "john@example.com" }
```

### Characters
```typescript
POST /api/v1/characters
FormData: { name: "Character", images: [file1, file2, file3] }

GET /api/v1/characters
DELETE /api/v1/characters/:id
```

### Templates
```typescript
GET /api/v1/templates?category=portrait&limit=20
POST /api/v1/templates/:id/favorite
```

## 💻 Frontend Usage

### Authentication
```typescript
import { useAuthStore } from '@/shared/stores';

const { login, verifyCode, logout, isLoading, error } = useAuthStore();

// Send code
await login('+1234567890');

// Verify
await verifyCode('+1234567890', '123456');

// Logout
logout();
```

### API Calls
```typescript
import { apiClient, authService, userService } from '@/shared/services';

// Auth
await authService.sendVerificationCode('+1234567890');
await authService.verifyCode('+1234567890', '123456');

// User
const user = await userService.getMe();
const profile = await userService.getProfile();
await userService.updateProfile({ name: 'John' });

// Direct API
const response = await apiClient.get('/characters');
```

## 🗄️ Database

### MongoDB Connection
```bash
# Local
mongod

# Or use connection string in .env
MONGODB_URI=mongodb://localhost:27017/nero
# Or MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nero
```

### Collections
- `users` - User accounts
- `characters` - User characters with images
- `templates` - Style templates
- `generatedimages` - AI generated images
- `favoritetemplates` - User favorites
- `verificationcodes` - SMS codes (auto-expire)

## 🔐 Environment Variables

### Backend (`server/.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nero
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Twilio (optional in dev)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## 🧪 Testing

### Test Authentication
```bash
# 1. Start servers
# 2. Open http://localhost:5173/login
# 3. Enter phone: +1234567890
# 4. Check backend console for code
# 5. Enter code
# 6. Should redirect to home
```

### Check Tokens
```javascript
// Browser console
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
```

### Test API
```bash
# Health check
curl http://localhost:5000/health

# Send code
curl -X POST http://localhost:5000/api/v1/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

## 🐛 Common Issues

### CORS Error
```
Solution: Update backend .env
CORS_ORIGIN=http://localhost:5173
```

### MongoDB Connection Error
```
Solution: Start MongoDB
mongod
# or
brew services start mongodb-community
```

### Port Already in Use
```
Solution: Kill process
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### 401 Unauthorized
```
Solution: Clear localStorage and login again
localStorage.clear()
```

## 📁 Project Structure

```
nero/
├── src/                          # Frontend
│   ├── features/                # Feature modules
│   ├── shared/                  # Shared resources
│   │   ├── services/           # API services ✨
│   │   ├── stores/             # State management
│   │   └── components/         # UI components
│   └── core/domain/            # Domain entities
│
└── server/                      # Backend
    └── src/
        ├── core/domain/        # Entities & interfaces
        ├── application/        # Use cases
        ├── infrastructure/     # DB & services
        └── presentation/       # Controllers & routes
```

## 🔑 Key Files

### Frontend
- `src/shared/services/api.ts` - HTTP client
- `src/shared/services/authService.ts` - Auth APIs
- `src/shared/stores/useAuthStore.ts` - Auth state
- `.env` - Environment config

### Backend
- `server/src/index.ts` - Entry point
- `server/src/app.ts` - Express setup
- `server/src/infrastructure/di/container.ts` - DI
- `server/.env` - Environment config

## 📚 Documentation

- `FRONTEND_API_INTEGRATION.md` - Integration guide
- `API_INTEGRATION_SUMMARY.md` - Implementation summary
- `server/API_DOCUMENTATION.md` - API reference
- `server/ARCHITECTURE.md` - Backend architecture
- `server/DEPLOYMENT.md` - Deployment guide
- `SYSTEM_OVERVIEW.md` - Full system overview

## 🎯 Development Workflow

1. **Start servers** (backend + frontend)
2. **Make changes** to code
3. **Test** in browser
4. **Check console** for errors
5. **Commit** to git
6. **Deploy** to production

## 🚀 Deployment

### Backend
```bash
# Railway (recommended)
railway login
railway init
railway up

# Or Heroku
heroku create nero-api
git push heroku main
```

### Frontend
```bash
# Vercel (recommended)
vercel

# Or Netlify
netlify deploy
```

## ✅ Checklist

### Development
- [ ] Backend running on :5000
- [ ] Frontend running on :5173
- [ ] MongoDB connected
- [ ] .env files configured
- [ ] Can login successfully
- [ ] Tokens stored in localStorage

### Production
- [ ] Environment variables set
- [ ] MongoDB Atlas configured
- [ ] Cloudinary configured
- [ ] Twilio configured
- [ ] CORS origin updated
- [ ] SSL/HTTPS enabled
- [ ] API URL updated in frontend

## 💡 Tips

- Use **React DevTools** to inspect state
- Use **Network tab** to debug API calls
- Check **backend console** for verification codes (dev mode)
- Use **MongoDB Compass** to view database
- Keep **both terminals** visible while developing

## 🆘 Help

### Get Logs
```bash
# Backend
pm2 logs nero-api

# Frontend build
npm run build
```

### Reset Everything
```bash
# Clear tokens
localStorage.clear()

# Restart servers
# Ctrl+C in both terminals, then restart

# Clear MongoDB (careful!)
mongosh
use nero
db.dropDatabase()
```

## 🎉 You're Ready!

Everything is set up and ready to go. Start both servers and begin developing!

```bash
cd server && npm run dev  # Terminal 1
npm run dev               # Terminal 2
```

Open `http://localhost:5173` and start coding! 🚀
