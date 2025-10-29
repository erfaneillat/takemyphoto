# Nero Backend Architecture

## 🏛️ Clean Architecture Overview

This backend follows **Clean Architecture** principles with clear separation of concerns and dependency inversion.

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │   Routes     │  │  Middleware  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Use Cases (Business Logic)              │   │
│  │  - SendVerificationCode  - CreateCharacter           │   │
│  │  - VerifyCode           - GetTemplates               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      Domain Layer                            │
│  ┌──────────────┐         ┌──────────────────────────┐      │
│  │   Entities   │         │  Repository Interfaces   │      │
│  │  - User      │         │  - IUserRepository       │      │
│  │  - Character │         │  - ICharacterRepository  │      │
│  │  - Template  │         │  - ITemplateRepository   │      │
│  └──────────────┘         └──────────────────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                   Infrastructure Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   MongoDB    │  │   Services   │  │      DI      │      │
│  │   Models &   │  │  - SMS       │  │  Container   │      │
│  │ Repositories │  │  - Upload    │  │              │      │
│  │              │  │  - JWT       │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
server/
├── src/
│   ├── core/                          # Core Domain Layer
│   │   └── domain/
│   │       ├── entities/             # Business Entities
│   │       │   ├── User.ts
│   │       │   ├── Character.ts
│   │       │   ├── Template.ts
│   │       │   ├── GeneratedImage.ts
│   │       │   ├── FavoriteTemplate.ts
│   │       │   └── VerificationCode.ts
│   │       └── repositories/         # Repository Interfaces
│   │           ├── IUserRepository.ts
│   │           ├── ICharacterRepository.ts
│   │           ├── ITemplateRepository.ts
│   │           ├── IGeneratedImageRepository.ts
│   │           ├── IFavoriteTemplateRepository.ts
│   │           └── IVerificationCodeRepository.ts
│   │
│   ├── application/                   # Application Layer
│   │   └── usecases/                 # Use Cases
│   │       ├── auth/
│   │       │   ├── SendVerificationCodeUseCase.ts
│   │       │   └── VerifyCodeUseCase.ts
│   │       ├── character/
│   │       │   ├── CreateCharacterUseCase.ts
│   │       │   ├── GetUserCharactersUseCase.ts
│   │       │   └── DeleteCharacterUseCase.ts
│   │       ├── template/
│   │       │   ├── GetTemplatesUseCase.ts
│   │       │   └── ToggleFavoriteTemplateUseCase.ts
│   │       └── user/
│   │           └── GetUserProfileUseCase.ts
│   │
│   ├── infrastructure/                # Infrastructure Layer
│   │   ├── database/
│   │   │   ├── models/              # MongoDB Models
│   │   │   │   ├── UserModel.ts
│   │   │   │   ├── CharacterModel.ts
│   │   │   │   ├── TemplateModel.ts
│   │   │   │   ├── GeneratedImageModel.ts
│   │   │   │   ├── FavoriteTemplateModel.ts
│   │   │   │   └── VerificationCodeModel.ts
│   │   │   ├── repositories/        # Repository Implementations
│   │   │   │   ├── UserRepository.ts
│   │   │   │   ├── CharacterRepository.ts
│   │   │   │   ├── TemplateRepository.ts
│   │   │   │   ├── GeneratedImageRepository.ts
│   │   │   │   ├── FavoriteTemplateRepository.ts
│   │   │   │   └── VerificationCodeRepository.ts
│   │   │   └── connection.ts        # Database Connection
│   │   ├── services/                # External Services
│   │   │   ├── SmsService.ts       # Twilio SMS
│   │   │   ├── FileUploadService.ts # Cloudinary
│   │   │   └── JwtService.ts       # JWT Auth
│   │   ├── di/
│   │   │   └── container.ts        # Dependency Injection
│   │   └── utils/
│   │       └── logger.ts           # Winston Logger
│   │
│   ├── presentation/                 # Presentation Layer
│   │   ├── controllers/             # HTTP Controllers
│   │   │   ├── AuthController.ts
│   │   │   ├── CharacterController.ts
│   │   │   ├── TemplateController.ts
│   │   │   └── UserController.ts
│   │   ├── routes/                  # Express Routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── characterRoutes.ts
│   │   │   ├── templateRoutes.ts
│   │   │   └── userRoutes.ts
│   │   └── middleware/              # Express Middleware
│   │       ├── authMiddleware.ts
│   │       ├── errorHandler.ts
│   │       ├── uploadMiddleware.ts
│   │       └── validationMiddleware.ts
│   │
│   ├── app.ts                       # Express App Setup
│   └── index.ts                     # Entry Point
│
├── .env.example                     # Environment Variables Template
├── .gitignore
├── package.json
├── tsconfig.json
├── nodemon.json
├── .eslintrc.js
├── README.md
├── API_DOCUMENTATION.md
└── ARCHITECTURE.md
```

## 🔄 Request Flow

```
1. HTTP Request
   ↓
2. Middleware (Auth, Validation, Upload)
   ↓
3. Route Handler
   ↓
4. Controller
   ↓
5. Use Case (Business Logic)
   ↓
6. Repository Interface
   ↓
7. Repository Implementation
   ↓
8. MongoDB Model
   ↓
9. Database
   ↓
10. Response back through the chain
```

## 🎯 Layer Responsibilities

### 1. Domain Layer (`core/domain/`)
**Pure business logic, no external dependencies**

- **Entities**: Core business objects (User, Character, Template, etc.)
- **Repository Interfaces**: Contracts for data access
- **No dependencies on frameworks or external libraries**

### 2. Application Layer (`application/`)
**Application-specific business rules**

- **Use Cases**: Orchestrate the flow of data
- **Business logic implementation**
- **Depend on domain interfaces only**
- **Independent of UI and database details**

### 3. Infrastructure Layer (`infrastructure/`)
**External concerns and implementations**

- **Database Models**: MongoDB schemas
- **Repository Implementations**: Concrete data access
- **External Services**: SMS, File Upload, JWT
- **Dependency Injection**: Wire everything together

### 4. Presentation Layer (`presentation/`)
**HTTP interface and request handling**

- **Controllers**: Handle HTTP requests/responses
- **Routes**: Define API endpoints
- **Middleware**: Authentication, validation, error handling
- **Input validation and transformation**

## 🔌 Dependency Injection

The `Container` class in `infrastructure/di/container.ts` manages all dependencies:

```typescript
Container
  ├── Repositories (Data Access)
  ├── Services (External APIs)
  ├── Use Cases (Business Logic)
  └── Controllers (HTTP Handlers)
```

**Benefits:**
- Loose coupling
- Easy testing (mock dependencies)
- Single source of truth for dependencies
- Clear dependency graph

## 🗄️ Data Flow Example: Create Character

```
1. POST /api/v1/characters
   ↓
2. authMiddleware (verify JWT)
   ↓
3. upload.array('images') (handle file upload)
   ↓
4. validate(characterSchemas.create) (validate input)
   ↓
5. CharacterController.createCharacter()
   ↓
6. CreateCharacterUseCase.execute()
   ├── FileUploadService.uploadImages() → Cloudinary
   └── CharacterRepository.create() → MongoDB
   ↓
7. Return Character entity
   ↓
8. Controller formats response
   ↓
9. JSON response to client
```

## 🔐 Security Layers

```
Request
  ↓
Helmet (Security Headers)
  ↓
CORS (Origin Validation)
  ↓
Rate Limiter (Abuse Prevention)
  ↓
Body Parser (Size Limits)
  ↓
Mongo Sanitize (NoSQL Injection Prevention)
  ↓
HPP (Parameter Pollution Prevention)
  ↓
JWT Middleware (Authentication)
  ↓
Input Validation (Joi Schemas)
  ↓
Business Logic
```

## 📊 Database Schema Design

### Collections

1. **users**
   - Primary user data
   - Subscription and stars
   - Indexed on: phoneNumber, email

2. **characters**
   - User's created characters
   - Embedded images array
   - Indexed on: userId, createdAt

3. **templates**
   - Style templates
   - Full-text search enabled
   - Indexed on: category, isTrending, tags

4. **generatedimages**
   - User's generated/edited images
   - Edit history tracking
   - Indexed on: userId, parentId

5. **favoritetemplates**
   - User-template relationships
   - Unique compound index: (userId, templateId)

6. **verificationcodes**
   - SMS verification codes
   - TTL index for auto-deletion
   - Indexed on: phoneNumber, expiresAt

## 🧪 Testing Strategy

### Unit Tests
- Test use cases in isolation
- Mock repository interfaces
- Test business logic

### Integration Tests
- Test repository implementations
- Test with test database
- Verify data persistence

### E2E Tests
- Test complete API flows
- Test authentication
- Test file uploads

## 🚀 Deployment Architecture

```
┌─────────────────┐
│   Load Balancer │
└────────┬────────┘
         │
    ┌────▼────┐
    │  NGINX  │ (Reverse Proxy)
    └────┬────┘
         │
    ┌────▼────────────────┐
    │  Node.js Instances  │ (PM2 Cluster)
    │  ┌────┐  ┌────┐    │
    │  │App1│  │App2│    │
    │  └────┘  └────┘    │
    └────┬────────────────┘
         │
    ┌────▼────┐    ┌──────────┐
    │ MongoDB │    │Cloudinary│
    │ Cluster │    │   CDN    │
    └─────────┘    └──────────┘
```

## 📈 Scalability Considerations

1. **Horizontal Scaling**: Stateless design allows multiple instances
2. **Database Indexing**: Optimized queries with proper indexes
3. **Caching**: Redis can be added for frequently accessed data
4. **CDN**: Cloudinary handles image delivery
5. **Rate Limiting**: Prevents abuse and ensures fair usage
6. **Async Processing**: Queue system for heavy operations (future)

## 🔧 Configuration Management

Environment-based configuration:
- **Development**: Mock services, verbose logging
- **Staging**: Real services, debug logging
- **Production**: Optimized, error logging only

## 📝 Best Practices Implemented

1. ✅ **Clean Architecture** - Clear separation of concerns
2. ✅ **SOLID Principles** - Single responsibility, dependency inversion
3. ✅ **Type Safety** - Full TypeScript coverage
4. ✅ **Error Handling** - Centralized error handling
5. ✅ **Security** - Multiple security layers
6. ✅ **Validation** - Input validation at boundaries
7. ✅ **Logging** - Structured logging with Winston
8. ✅ **Documentation** - Comprehensive API docs
9. ✅ **Code Organization** - Feature-based structure
10. ✅ **Dependency Injection** - Testable, maintainable code

## 🎓 Learning Resources

- **Clean Architecture**: Robert C. Martin
- **Domain-Driven Design**: Eric Evans
- **Node.js Best Practices**: goldbergyoni/nodebestpractices
- **TypeScript Deep Dive**: basarat.gitbook.io
