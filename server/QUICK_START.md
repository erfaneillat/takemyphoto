# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Minimum required for development
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nero
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
CORS_ORIGIN=http://localhost:5173

# Optional in development (uses mock services)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### 3. Start MongoDB
```bash
# Using local MongoDB
mongod

# Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env
```

### 4. Run Development Server
```bash
npm run dev
```

Server will start at: `http://localhost:5000`

### 5. Test the API
```bash
# Health check
curl http://localhost:5000/health

# Send verification code (in dev, code is logged to console)
curl -X POST http://localhost:5000/api/v1/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'

# Check console for the code, then verify
curl -X POST http://localhost:5000/api/v1/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "code": "XXXXXX"}'
```

## 📝 Development Notes

### Mock Services in Development
- **SMS**: Codes are logged to console instead of being sent
- **File Upload**: Images are stored locally in the `/uploads` directory

### Default Test Code
In development mode, any 6-digit code will work for testing.

### API Documentation
- Full API docs: `API_DOCUMENTATION.md`
- Architecture: `ARCHITECTURE.md`
- Main README: `README.md`

## 🔧 Common Commands

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Run tests
npm test
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
mongod
# or
brew services start mongodb-community
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in `.env` or kill the process using port 5000
```bash
lsof -ti:5000 | xargs kill -9
```

### TypeScript Path Errors
**Solution**: Make sure `tsconfig-paths` is installed
```bash
npm install --save-dev tsconfig-paths
```

## 📱 Connect Frontend

Update your frontend API base URL to:
```typescript
const API_BASE_URL = 'http://localhost:5000/api/v1';
```

## 🎯 Next Steps

1. ✅ Test authentication flow
2. ✅ Configure Twilio for SMS (production)
3. ✅ Add seed data for templates
4. ✅ Implement remaining features
5. ✅ Write tests
6. ✅ Deploy to production

## 📚 Learn More

- **API Endpoints**: See `API_DOCUMENTATION.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Full Guide**: See `README.md`
