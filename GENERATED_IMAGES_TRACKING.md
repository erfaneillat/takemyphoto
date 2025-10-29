# Generated Images Tracking System

Implemented a complete system to save and track all generated and edited images by user.

## Overview

Every time a user generates or edits an image using NanoBanana API, the system now:
1. Creates a record when the task starts (pending status)
2. Updates the record when the task completes with the final image URL
3. Tracks all metadata (prompt, type, references, characters used)
4. Allows users to retrieve their generation history

## Database Schema

### GeneratedImageEntity Collection

```typescript
{
  id: string;                    // MongoDB ObjectId
  userId: string;                // User who generated the image
  taskId: string;                // NanoBanana task ID (unique)
  prompt: string;                // The prompt used
  type: 'TEXTTOIAMGE' | 'IMAGETOIAMGE';  // Generation or editing
  imageUrl: string;              // Final generated image URL
  originImageUrl?: string;       // Original image for edits
  referenceImageUrls?: string[]; // Input images used
  characterIds?: string[];       // Characters used
  status: 'pending' | 'completed' | 'failed';
  error?: string;                // Error message if failed
  createdAt: Date;               // When task was created
  completedAt?: Date;            // When task completed
}
```

### Indexes
- `{ userId: 1, createdAt: -1 }` - Get user's images sorted by date
- `{ taskId: 1 }` - Unique task lookup
- `{ userId: 1, status: 1 }` - Filter by user and status

## API Endpoints

### Get User's Generated Images
```
GET /api/v1/nanobanana/images?limit=50&skip=0
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "images": [
      {
        "id": "...",
        "userId": "...",
        "taskId": "...",
        "prompt": "A beautiful sunset",
        "type": "TEXTTOIAMGE",
        "imageUrl": "https://...",
        "status": "completed",
        "createdAt": "2025-10-25T...",
        "completedAt": "2025-10-25T..."
      }
    ],
    "pagination": {
      "total": 42,
      "limit": 50,
      "skip": 0,
      "hasMore": false
    }
  }
}
```

## Workflow

### Text-to-Image Generation
1. User submits prompt on GeneratePage
2. Frontend calls `POST /api/v1/nanobanana/generate`
3. Backend creates GeneratedImageEntity with `status: 'pending'`
4. Backend calls NanoBanana API
5. NanoBanana processes and sends callback
6. Backend updates GeneratedImageEntity with image URL and `status: 'completed'`
7. Frontend polls and displays the image

### Image-to-Image Editing
1. User uploads image and submits prompt on EditPage
2. Frontend calls `POST /api/v1/nanobanana/edit`
3. Backend creates GeneratedImageEntity with `status: 'pending'`
4. Backend uploads reference image to local storage
5. Backend calls NanoBanana API with image URL
6. NanoBanana processes and sends callback
7. Backend updates GeneratedImageEntity with result
8. Frontend polls and displays the edited image

## Files Created

### Backend
- `/server/src/core/domain/entities/GeneratedImageEntity.ts` - Entity definition
- `/server/src/core/domain/repositories/IGeneratedImageEntityRepository.ts` - Repository interface
- `/server/src/infrastructure/database/models/GeneratedImageEntityModel.ts` - MongoDB schema
- `/server/src/infrastructure/database/repositories/GeneratedImageEntityRepository.ts` - Repository implementation

### Modified
- `/server/src/application/usecases/nanobanana/GenerateImageUseCase.ts` - Creates initial record
- `/server/src/application/usecases/nanobanana/HandleCallbackUseCase.ts` - Updates with results
- `/server/src/presentation/controllers/NanoBananaController.ts` - Added getUserGeneratedImages endpoint
- `/server/src/presentation/routes/nanobananaRoutes.ts` - Added GET /images route
- `/server/src/infrastructure/di/container.ts` - Injected repository

## Features

✅ **Automatic Tracking** - Every generation/edit is recorded
✅ **User Association** - Know which user generated which images
✅ **Status Tracking** - pending → completed/failed
✅ **Metadata Storage** - Prompt, type, references, characters
✅ **History Retrieval** - Get all user's images with pagination
✅ **Error Logging** - Failed generations store error messages
✅ **Timestamps** - Creation and completion times recorded

## Usage

### Retrieve User's Generated Images
```typescript
// Frontend
const response = await fetch('/api/v1/nanobanana/images?limit=20&skip=0', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();
console.log(data.images); // Array of generated images
console.log(data.pagination); // Pagination info
```

### Filter by Status
```typescript
// Get only completed images
const completed = images.filter(img => img.status === 'completed');

// Get only failed images
const failed = images.filter(img => img.status === 'failed');
```

## Future Enhancements

- [ ] Add frontend gallery page to display user's generated images
- [ ] Add filtering by type (generation vs editing)
- [ ] Add search by prompt
- [ ] Add favorites/bookmarking
- [ ] Add sharing functionality
- [ ] Add download history
- [ ] Add regeneration from history
- [ ] Add batch operations (delete, export)
