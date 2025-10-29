# Nero Backend API

Backend API for Nero - AI Photo Editing Platform built with Node.js, TypeScript, MongoDB, and Express following Clean Architecture principles.

## 🏗️ Architecture

The project follows **Clean Architecture** with clear separation of concerns:

```
src/
├── core/                           # Core Business Logic
│   └── domain/
│       ├── entities/              # Business entities
│       └── repositories/          # Repository interfaces
├── infrastructure/                 # External Services & Implementations
│   ├── database/
│   │   ├── models/               # MongoDB models
│   │   ├── repositories/         # Repository implementations
│   │   └── connection.ts         # Database connection
│   ├── services/                 # External services (SMS, File Upload, JWT)
│   └── di/                       # Dependency Injection container
├── application/                    # Application Business Rules
│   └── usecases/                 # Use cases (business logic)
├── presentation/                   # Controllers, Routes, Middleware
│   ├── controllers/
│   ├── routes/
│   └── middleware/
├── app.ts                         # Express app setup
└── index.ts                       # Entry point
```

## 🚀 Features

- **Authentication**: Phone-based SMS verification with JWT
- **User Management**: Profile, subscription tiers, stars system
- **Character Management**: Create, update, delete characters with images
- **Template System**: Browse, search, and favorite templates
- **Image Upload**: Cloudinary integration for image storage
- **Security**: Helmet, rate limiting, input validation, sanitization
- **Clean Architecture**: Separation of concerns, testable code

## 📋 Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Cloudinary account (for image storage)
- Twilio account (for SMS - optional in development)

## 🛠️ Installation

1. **Clone and navigate to server folder:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and configure:
- MongoDB connection string
- JWT secrets
- Cloudinary credentials
- Twilio credentials (optional for development)
- CORS origin

4. **Start MongoDB:**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

5. **Run in development mode:**
```bash
npm run dev
```

6. **Build for production:**
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
- `POST /auth/send-code` - Send verification code to phone
- `POST /auth/verify-code` - Verify code and login

### Users
- `GET /users/me` - Get current user
- `GET /users/profile` - Get user profile with stats
- `PATCH /users/profile` - Update user profile

### Characters
- `POST /characters` - Create character (with images)
- `GET /characters` - Get user's characters
- `DELETE /characters/:id` - Delete character

### Templates
- `GET /templates` - Get templates (with filters)
  - Query params: `category`, `search`, `trending`, `limit`, `offset`
- `POST /templates/:templateId/favorite` - Toggle favorite

## 🔐 Authentication

All protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. **Send Verification Code:**
```bash
POST /api/v1/auth/send-code
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

2. **Verify Code:**
```bash
POST /api/v1/auth/verify-code
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "code": "123456"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

## 📤 File Upload Example

**Create Character with Images:**
```bash
POST /api/v1/characters
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: "My Character"
images: [file1.jpg, file2.jpg, file3.jpg]
```

## 🗄️ Database Models

### User
- Phone number (unique)
- Name, email (optional)
- Subscription tier (free/pro/premium)
- Stars count
- Verification status

### Character
- User reference
- Name
- Images (3-5 images with Cloudinary URLs)
- Timestamps

### Template
- Image URL
- Prompt
- Style, category, tags
- Trending flag
- View and like counts

### GeneratedImage
- User reference
- Type (generate/edit)
- Prompt
- Image URL
- Parent ID (for edit history)
- Metadata

### FavoriteTemplate
- User and template references
- Unique constraint per user-template pair

### VerificationCode
- Phone number
- Code (6 digits)
- Expiry time
- Usage status
- Attempt count

## 🔒 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Joi schemas
- **MongoDB Sanitization**: Prevent NoSQL injection
- **HPP**: HTTP Parameter Pollution protection
- **JWT**: Secure authentication
- **CORS**: Configured origins

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

**Critical Variables:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLOUDINARY_*` - Cloudinary credentials
- `TWILIO_*` - Twilio credentials (optional in dev)

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure production MongoDB
4. Setup Cloudinary production account
5. Configure Twilio for SMS
6. Set appropriate CORS origins
7. Enable HTTPS
8. Setup monitoring and logging

### Deploy to Services

**Heroku:**
```bash
heroku create nero-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<your-mongodb-uri>
# Set other env variables
git push heroku main
```

**Railway/Render:**
- Connect GitHub repository
- Set environment variables in dashboard
- Deploy automatically on push

## 📊 API Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ ... ] // For validation errors
}
```

## 🔄 Development Workflow

1. Create feature branch
2. Implement use case in `application/usecases/`
3. Create/update repository if needed
4. Create/update controller
5. Add route
6. Test with Postman/Thunder Client
7. Commit and push

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Twilio Documentation](https://www.twilio.com/docs)

## 🤝 Contributing

1. Follow Clean Architecture principles
2. Write type-safe TypeScript code
3. Add proper error handling
4. Validate all inputs
5. Document API endpoints

## 📄 License

MIT
