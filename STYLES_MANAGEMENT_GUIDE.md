# Styles Management System - Implementation Guide

This guide describes the newly implemented style and category management system for the Nero application.

## Overview

A complete style management system has been implemented with the following features:
- **Admin Panel**: Manage categories and styles (templates) through a dedicated admin interface
- **Public Explore Page**: Users can browse and filter styles by category in the main app
- **Backend API**: Complete REST API with clean architecture for managing categories and styles

---

## Backend Implementation

### 1. Category System

#### Entities & Models
- **Entity**: `/server/src/core/domain/entities/Category.ts`
- **Model**: `/server/src/infrastructure/database/models/CategoryModel.ts`
- **Repository**: `/server/src/infrastructure/database/repositories/CategoryRepository.ts`

#### Category Schema
```typescript
{
  id: string;
  name: string;          // Display name
  slug: string;          // URL-friendly identifier
  description?: string;  // Optional description
  icon?: string;         // Emoji or icon
  order: number;         // Display order
  isActive: boolean;     // Published status
}
```

#### Use Cases
- `CreateCategoryUseCase`: Create new category
- `GetCategoriesUseCase`: List all categories (with optional active filter)
- `UpdateCategoryUseCase`: Update existing category
- `DeleteCategoryUseCase`: Delete category

#### API Endpoints
**Base URL**: `/api/v1/categories`

- `GET /categories` - Get all categories (query: `isActive=true|false`)
- `POST /categories` - Create category (Protected)
- `PUT /categories/:id` - Update category (Protected)
- `DELETE /categories/:id` - Delete category (Protected)

---

### 2. Style/Template System Enhancement

#### Admin Template Management

New use cases added:
- `CreateTemplateUseCase`: Create new template with image upload
- `UpdateTemplateUseCase`: Update template metadata
- `DeleteTemplateUseCase`: Delete template

#### API Endpoints
**Base URL**: `/api/v1/admin/templates`

- `GET /admin/templates` - List all templates (Protected)
- `POST /admin/templates` - Create template with image upload (Protected)
- `PUT /admin/templates/:id` - Update template (Protected)
- `DELETE /admin/templates/:id` - Delete template (Protected)

**Public Template Endpoints** (existing):
- `GET /templates` - Get templates (query: `category`, `search`, `trending`, `limit`, `offset`)
- `POST /templates/:templateId/favorite` - Toggle favorite (Protected)

---

## Admin Panel Implementation

### 1. Categories Management Page
**Location**: `/panel/src/pages/Categories.tsx`

**Features**:
- View all categories in a grid layout
- Create new categories with auto-slug generation
- Edit existing categories
- Delete categories (with confirmation)
- Display active/inactive status
- Support for emoji icons
- Order management

**Route**: `/categories`

---

### 2. Styles Management Page
**Location**: `/panel/src/pages/Styles.tsx`

**Features**:
- View all style templates with preview images
- Create new styles with image upload
- Category selection (from active categories)
- Edit style metadata (prompt, category, tags, trending status)
- Delete styles (with confirmation)
- Preview images during upload
- Tag management (comma-separated)
- Trending flag toggle
- View statistics (views, likes)

**Route**: `/styles`

---

### 3. Navigation Updates
**Location**: `/panel/src/components/layout/AdminLayout.tsx`

Added menu items:
- **Categories** (Tag icon)
- **Styles** (Palette icon)

---

## Frontend (Main App) Implementation

### 1. Template API Service
**Location**: `/src/shared/services/templateApi.ts`

Provides functions for:
- `templateApi.getTemplates()` - Fetch templates with filters
- `categoryApi.getCategories()` - Fetch categories
- `templateApi.toggleFavorite()` - Toggle favorite status

---

### 2. Explore Page Updates
**Location**: `/src/features/explore/ExplorePage.tsx`

**New Features**:
- Dynamic category tabs loaded from API
- Real-time data fetching from backend
- Category icons displayed in tabs
- Search functionality with debouncing
- Loading states
- Empty state handling
- Template data passed to edit page

**Dynamic Tabs**: 
- "All" (shows everything)
- "Trending" (shows trending styles)
- Dynamic categories from database (with icons)

---

## Environment Configuration

### Backend
**File**: `/server/.env.example`
```
PORT=3000
API_VERSION=v1
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### Frontend (Main App)
**File**: `/.env.example`
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Admin Panel
**File**: `/panel/.env.example`
```
VITE_API_URL=http://localhost:3000/api/v1
```

---

## Translation Support

Both English and Persian translations have been updated:
- Added `noResults` key for empty state in explore page
- All existing translation keys work with dynamic categories

**Files Updated**:
- `/src/shared/translations/en.json`
- `/src/shared/translations/fa.json`

---

## Database Schema

### Category Collection
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  slug: String (required, unique, lowercase),
  description: String (optional),
  icon: String (optional),
  order: Number (default: 0),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Template Collection (Enhanced)
```javascript
{
  _id: ObjectId,
  imageUrl: String (required),
  publicId: String (required),
  prompt: String (required),
  style: String (optional),
  category: String (required), // Refers to category slug
  tags: [String],
  isTrending: Boolean (default: false),
  viewCount: Number (default: 0),
  likeCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Usage Flow

### Admin Flow
1. **Create Categories**:
   - Go to `/categories` in admin panel
   - Click "Add Category"
   - Enter name (slug auto-generated), description, icon (emoji), and order
   - Save category

2. **Create Styles**:
   - Go to `/styles` in admin panel
   - Click "Add Style"
   - Upload image
   - Enter prompt
   - Select category from dropdown (or create new in categories page)
   - Add tags (comma-separated)
   - Optionally mark as trending
   - Save style

### User Flow
1. User visits Explore page
2. Categories are dynamically loaded as tabs
3. User can filter by category or search
4. Clicking "Use this style" navigates to edit page with template data
5. Template information is passed to edit page for use

---

## API Authentication

Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Token should be stored in localStorage as `token` key for admin panel.

---

## Next Steps (Optional Enhancements)

1. **Admin Authentication**: Add proper admin role checking middleware
2. **Image Optimization**: Add image compression/optimization for uploads
3. **Bulk Operations**: Add bulk delete/update for categories and styles
4. **Analytics**: Track template usage and popular categories
5. **Category Hierarchy**: Add parent-child category relationships
6. **Style Versioning**: Track style updates and versions
7. **Search Optimization**: Add full-text search indexing
8. **Cache Layer**: Add Redis caching for frequently accessed data

---

## Troubleshooting

### Categories not showing in Styles page
- Ensure categories have `isActive: true`
- Check API endpoint `/api/v1/categories?isActive=true`

### Images not uploading
- Verify Cloudinary credentials in server environment
- Check multer configuration in uploadMiddleware
- Ensure file size limits are appropriate

### Styles not appearing in Explore page
- Verify category slug matches between styles and categories
- Check that templates have valid category field
- Ensure API_BASE_URL is correctly set in frontend .env

---

## File Structure Summary

```
server/src/
├── core/domain/
│   ├── entities/Category.ts (NEW)
│   └── repositories/ICategoryRepository.ts (NEW)
├── application/usecases/
│   ├── category/ (NEW)
│   │   ├── CreateCategoryUseCase.ts
│   │   ├── GetCategoriesUseCase.ts
│   │   ├── UpdateCategoryUseCase.ts
│   │   └── DeleteCategoryUseCase.ts
│   └── template/ (ENHANCED)
│       ├── CreateTemplateUseCase.ts (NEW)
│       ├── UpdateTemplateUseCase.ts (NEW)
│       └── DeleteTemplateUseCase.ts (NEW)
├── infrastructure/
│   └── database/
│       ├── models/CategoryModel.ts (NEW)
│       └── repositories/CategoryRepository.ts (NEW)
└── presentation/
    ├── controllers/
    │   ├── CategoryController.ts (NEW)
    │   └── AdminTemplateController.ts (NEW)
    └── routes/
        ├── categoryRoutes.ts (NEW)
        └── adminTemplateRoutes.ts (NEW)

panel/src/
└── pages/
    ├── Categories.tsx (NEW)
    └── Styles.tsx (NEW)

src/
├── features/explore/
│   └── ExplorePage.tsx (UPDATED)
└── shared/
    └── services/
        └── templateApi.ts (NEW)
```

---

## Conclusion

The complete style management system is now implemented with:
- ✅ Backend API with clean architecture
- ✅ Admin panel for managing categories and styles
- ✅ Dynamic explore page with real-time data
- ✅ Image upload support
- ✅ Category management
- ✅ Multi-language support
- ✅ Search and filter capabilities

The system is ready for use and can be extended with additional features as needed.
