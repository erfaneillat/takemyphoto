# Google AI Studio Migration Guide

## Overview
Successfully migrated from NanoBanana API to Google AI Studio API (Gemini 2.5 Flash Image model) for AI image generation and editing.

## Key Changes

### 1. API Architecture Change
**Before (NanoBanana):**
- Asynchronous task-based API
- Create task → Poll status → Receive callback
- Required task tracking in database
- Complex state management

**After (Google AI):**
- Synchronous API - immediate responses
- Single request/response cycle
- No task tracking needed
- Simplified state management

### 2. Files Created
- `/server/src/infrastructure/services/GoogleAIService.ts` - New service for Google AI API integration

### 3. Files Modified

#### Services
- **Replaced:** `NanoBananaService` → `GoogleAIService`
- Uses Gemini 2.5 Flash Image model
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`
- Authentication: `x-goog-api-key` header

#### Use Cases
- **`GenerateImageUseCase.ts`**
  - Removed task creation and callback logic
  - Images now returned immediately
  - Creates completed record in database directly
  - Converts base64 response to local file

- **`EditImageUseCase.ts`**
  - Same synchronous pattern as generate
  - Reference images converted to base64 inline
  - Immediate response with edited image

- **Removed Use Cases:**
  - `GetTaskStatusUseCase.ts` - No longer needed
  - `HandleCallbackUseCase.ts` - No longer needed

#### Controllers
- **`NanoBananaController.ts`** → **`ImageGenerationController`**
  - Removed task status endpoint
  - Removed callback endpoint
  - Simplified to generate and edit endpoints only
  - Returns image data immediately

#### Routes
- **`nanobananaRoutes.ts`**
  - Renamed export: `createNanoBananaRoutes` → `createImageGenerationRoutes`
  - Removed `/task/:taskId` endpoint
  - Removed `/callback` endpoint
  - Kept: `/generate`, `/edit`, `/images` (history)
  - Route path kept as `/nanobanana` for backwards compatibility

#### DI Container
- Replaced `nanoBananaService` with `googleAIService`
- Removed `getTaskStatusUseCase` and `handleCallbackUseCase`
- Renamed `nanoBananaController` to `imageGenerationController`
- Updated all dependency injections

#### Entities
- **`GeneratedImageEntity.ts`**
  - Made `taskId` optional (not needed for sync APIs)
  - Allowed `completedAt` in DTO for immediate completion

#### App Configuration
- Updated route imports in `app.ts`
- Route still accessible at `/api/v1/nanobanana/*` for compatibility

### 4. Environment Variables
**Before:**
```env
NANOBANANA_API_KEY=your-nanobanana-api-key-here
```

**After:**
```env
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
```

## API Comparison

### Generate Image (Text-to-Image)

**NanoBanana (Old):**
```
POST /api/v1/nanobanana/generate
Response: { taskId, status: 'pending', message }
→ Poll /api/v1/nanobanana/task/:taskId
→ Wait for callback
```

**Google AI (New):**
```
POST /api/v1/nanobanana/generate
Response: { imageUrl, imageId, prompt, aspectRatio }
→ Image ready immediately
```

### Edit Image (Image-to-Image)

**NanoBanana (Old):**
```
POST /api/v1/nanobanana/edit
Response: { taskId, status: 'pending', message }
→ Poll /api/v1/nanobanana/task/:taskId
→ Wait for callback
```

**Google AI (New):**
```
POST /api/v1/nanobanana/edit
Response: { imageUrl, imageId, prompt, aspectRatio }
→ Image ready immediately
```

## Features Supported

### Image Generation
- ✅ Text-to-image generation
- ✅ Image-to-image editing (with reference images)
- ✅ Aspect ratio control (1:1, 9:16, 16:9, 3:4, 4:3, 3:2, 2:3, 5:4, 4:5, 21:9)
- ✅ Base64 image handling
- ✅ Local file storage
- ✅ User history tracking

### Currently Limited
- ⚠️ Single image per request (Google AI generates one image at a time)
- ⚠️ Character images from URLs need download + conversion to base64
- ⚠️ numImages parameter accepted but only generates 1 image

## Setup Instructions

### 1. Get Google AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the API key

### 2. Update Environment Variables
```bash
# In server/.env
GOOGLE_AI_API_KEY=your-actual-google-ai-api-key
```

### 3. Install Dependencies (if needed)
```bash
cd server
npm install
```

### 4. Database Migration
No database migration needed - existing `generatedImageEntity` schema supports both sync and async patterns.

### 5. Restart Server
```bash
npm run dev
```

## Frontend Compatibility

### Frontend Changes Required
The frontend currently polls for task status. After backend migration:

**Current Frontend Flow:**
```typescript
1. POST /api/v1/nanobanana/generate → { taskId }
2. Poll GET /api/v1/nanobanana/task/:taskId
3. Display result when status = 'completed'
```

**New Frontend Flow:**
```typescript
1. POST /api/v1/nanobanana/generate → { imageUrl, imageId }
2. Display result immediately (no polling needed)
```

**Frontend files to update:**
- `/src/shared/services/nanoBananaApi.ts` - Remove polling logic
- `/src/features/generate/hooks/useImageGenerator.ts` - Handle immediate response
- `/src/features/edit/hooks/useImageEditor.ts` - Handle immediate response

## Benefits of Migration

### Performance
- **Faster:** No polling delays, immediate results
- **Simpler:** One API call instead of multiple
- **Reliable:** No callback webhook issues in development

### Code Quality
- **Less Code:** Removed ~400 lines (task tracking, callbacks, polling)
- **Simpler Logic:** Direct request/response flow
- **Easier Debugging:** Synchronous operations

### Infrastructure
- **No Task Database:** GenerationTask repository can be removed eventually
- **No Callback Endpoint:** No need for public webhook
- **Less State:** No pending/processing states to manage

## Troubleshooting

### Error: "No image returned from Google AI API"
- Check API key is valid
- Check rate limits (Google AI has free tier limits)
- Check image prompt doesn't violate content policy

### Error: "Google AI API key is not configured"
- Ensure `GOOGLE_AI_API_KEY` is set in `.env`
- Restart server after adding environment variable

### Images not saving locally
- Check `uploads/nero/generated/` directory exists
- Check file permissions
- Check disk space

## Migration Checklist

### Backend ✅
- [x] Created GoogleAIService
- [x] Updated GenerateImageUseCase
- [x] Updated EditImageUseCase
- [x] Updated ImageGenerationController
- [x] Updated routes
- [x] Updated DI container
- [x] Updated environment variables
- [x] Updated entity to support sync flow

### Frontend ⏳
- [ ] Update nanoBananaApi service
- [ ] Remove polling logic
- [ ] Update useImageGenerator hook
- [ ] Update useImageEditor hook
- [ ] Test generate flow
- [ ] Test edit flow
- [ ] Update loading states

### Cleanup (Optional) 🗑️
- [ ] Remove NanoBananaService.ts
- [ ] Remove GetTaskStatusUseCase.ts
- [ ] Remove HandleCallbackUseCase.ts
- [ ] Remove GenerationTask entity/repository (if no longer needed)
- [ ] Remove RemoteImageService (if only used for NanoBanana)

## API Response Examples

### Generate Image Success
```json
{
  "status": "success",
  "data": {
    "imageUrl": "/uploads/nero/generated/1730000000000-abc123.png",
    "imageId": "673abc123def456789",
    "prompt": "A cat eating a nano banana",
    "aspectRatio": "1:1"
  }
}
```

### Edit Image Success
```json
{
  "status": "success",
  "data": {
    "imageUrl": "/uploads/nero/generated/1730000001000-def456.png",
    "imageId": "673abc123def456790",
    "prompt": "Make the background sunset",
    "aspectRatio": "16:9"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Google AI API error: Content policy violation"
}
```

## Notes

- Routes kept at `/api/v1/nanobanana/*` for backwards compatibility
- Controller renamed to `ImageGenerationController` but files kept in `nanobanana` folder
- Database records include `taskId` field (optional) for future compatibility
- Local file storage used for all generated images
- Images returned as `/uploads/nero/generated/*` paths
- Frontend needs update to remove polling and handle immediate responses

## Support

For issues or questions about the migration:
1. Check Google AI Studio documentation: https://ai.google.dev/gemini-api/docs/image-generation
2. Review error logs in console
3. Check API key permissions and quotas
4. Verify environment variables are loaded correctly
