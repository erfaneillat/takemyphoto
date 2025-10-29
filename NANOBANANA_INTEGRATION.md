# NanoBanana API Integration

Complete integration of NanoBanana AI image generation and editing API into the Nero app.

## Overview

Implemented full-stack integration with NanoBanana API for:
- **Text-to-Image Generation** (TEXTTOIAMGE) - Generate images from text prompts
- **Image-to-Image Editing** (IMAGETOIAMGE) - Edit existing images with prompts

## Backend Implementation

### Files Created

#### Domain Layer
1. `/server/src/core/domain/entities/GenerationTask.ts`
   - GenerationTask entity with task tracking
   - Status: pending → processing → completed/failed
   - Stores prompts, images, and results

2. `/server/src/core/domain/repositories/IGenerationTaskRepository.ts`
   - Repository interface for task management
   - CRUD operations and task lookup

#### Infrastructure Layer
3. `/server/src/infrastructure/services/NanoBananaService.ts`
   - NanoBanana API client
   - Handles API requests and authentication
   - Generates callback URLs

4. `/server/src/infrastructure/database/models/GenerationTaskModel.ts`
   - MongoDB schema for generation tasks
   - Indexes on taskId, userId, status

5. `/server/src/infrastructure/database/repositories/GenerationTaskRepository.ts`
   - Implementation of IGenerationTaskRepository
   - MongoDB operations

#### Application Layer
6. `/server/src/application/usecases/nanobanana/GenerateImageUseCase.ts`
   - Text-to-image generation use case
   - Uploads reference images
   - Creates task and calls NanoBanana API

7. `/server/src/application/usecases/nanobanana/EditImageUseCase.ts`
   - Image-to-image editing use case
   - Requires at least one input image

8. `/server/src/application/usecases/nanobanana/GetTaskStatusUseCase.ts`
   - Retrieves task status
   - Verifies user ownership

9. `/server/src/application/usecases/nanobanana/HandleCallbackUseCase.ts`
   - Processes callbacks from NanoBanana API
   - Updates task status and results

#### Presentation Layer
10. `/server/src/presentation/controllers/NanoBananaController.ts`
    - HTTP request handlers
    - Validation and error handling

11. `/server/src/presentation/routes/nanobananaRoutes.ts`
    - Route definitions
    - Multer file upload middleware

### Files Modified

1. `/server/src/infrastructure/di/container.ts`
   - Added NanoBanana service, repository, use cases, controller
   - Dependency injection configuration

2. `/server/src/app.ts`
   - Added `/api/v1/nanobanana` routes

3. `/server/.env.example`
   - Added NANOBANANA_API_KEY
   - Added API_BASE_URL for callbacks

## Frontend Implementation

### Files Created

1. `/src/shared/services/nanoBananaApi.ts`
   - API client for NanoBanana endpoints
   - Task polling with status updates
   - Type-safe request/response interfaces

### Files Modified

1. `/src/features/generate/hooks/useImageGenerator.ts`
   - Integrated real API calls instead of mock
   - Polls task status until completion
   - Handles errors gracefully

2. `/src/features/edit/hooks/useImageEditor.ts`
   - Integrated image editing API
   - Real-time task status updates
   - Error handling

3. `/src/shared/services/index.ts`
   - Exported nanoBananaApi

## API Endpoints

### Generate Image (Text-to-Image)
```
POST /api/v1/nanobanana/generate
```
- **Auth**: Required
- **Body**: FormData
  - `prompt` (string, required)
  - `numImages` (number, optional, default: 1)
  - `imageSize` (string, optional, default: "1:1")
  - `images` (File[], optional)
  - `characterImageUrls` (JSON string, optional)
- **Response**: `{ taskId, status: 'pending', message }`

### Edit Image (Image-to-Image)
```
POST /api/v1/nanobanana/edit
```
- **Auth**: Required
- **Body**: FormData (same as generate, but images required)
- **Response**: `{ taskId, status: 'pending', message }`

### Get Task Status
```
GET /api/v1/nanobanana/task/:taskId
```
- **Auth**: Required
- **Response**: Full task object with status and results

### Callback (From NanoBanana)
```
POST /api/v1/nanobanana/callback
```
- **Auth**: Not required (called by NanoBanana)
- **Body**: Callback data with taskId, status, imageUrls, error

## Environment Variables

### Backend (.env)
```bash
NANOBANANA_API_KEY=your-nanobanana-api-key-here
API_BASE_URL=http://localhost:2000
```

## Features

### Text-to-Image Generation (GeneratePage)
- Enter text prompt
- Upload reference images (optional, up to 3)
- Attach characters (optional, up to 2)
- Generate image with 1:1 aspect ratio
- View results in history carousel
- Real-time progress updates

### Image-to-Image Editing (EditPage)
- Upload images to edit (required, up to 3)
- Attach character references (optional, up to 1)
- Enter editing prompt
- Generate edited images
- View results in history carousel
- Real-time progress updates

### Task Management
- Tasks stored in MongoDB
- Status tracking: pending → processing → completed/failed
- Automatic polling every 5 seconds
- Maximum 60 polling attempts (5 minutes)
- Error handling and user feedback

## Architecture Highlights

### Clean Architecture
- **Domain Layer**: Entities and repository interfaces
- **Application Layer**: Use cases encapsulating business logic
- **Infrastructure Layer**: External services and database
- **Presentation Layer**: Controllers and routes

### State Management
- Riverpod-style hooks (useImageGenerator, useImageEditor)
- Local state for UI
- API calls abstracted in services

### Error Handling
- Try-catch blocks in all async operations
- User-friendly error messages
- Console logging for debugging

### Image Handling
- Images uploaded to local server via LocalFileUploadService
- Stored in `/uploads/nero/references/` directory
- Full URLs generated for NanoBanana API
- Served as static files via Express

## Workflow

1. **User submits request** (generate or edit)
2. **Frontend uploads images** to local server (if any)
3. **Backend creates task** in database
4. **Backend calls NanoBanana API** with prompt and image URLs
5. **NanoBanana returns taskId** immediately
6. **Frontend polls task status** every 5 seconds
7. **NanoBanana processes** image generation/editing
8. **NanoBanana calls callback** endpoint when complete
9. **Backend updates task** with results or error
10. **Frontend receives results** on next poll
11. **User sees generated images** in history

## Image Size Options

Supported aspect ratios:
- `1:1` - Square (default)
- `9:16` - Portrait (mobile)
- `16:9` - Landscape (widescreen)
- `3:4` - Portrait
- `4:3` - Landscape (traditional)
- `3:2` - Landscape (photo)
- `2:3` - Portrait (photo)
- `5:4` - Portrait (close to square)
- `4:5` - Portrait (close to square)
- `21:9` - Ultra-wide landscape

## Testing

### Manual Testing Steps

1. **Setup**
   ```bash
   # Add API key to server/.env
   NANOBANANA_API_KEY=your-key-here
   
   # Start backend
   cd server && npm run dev
   
   # Start frontend
   cd .. && npm run dev
   ```

2. **Test Text-to-Image**
   - Navigate to `/generate`
   - Enter prompt: "A serene mountain landscape at sunset"
   - Click "Generate"
   - Wait for result (shown in console and UI)

3. **Test Image-to-Image**
   - Navigate to `/edit`
   - Upload an image
   - Enter prompt: "Make it look like a painting"
   - Click "Generate"
   - Wait for result

4. **Test with References**
   - Add character images via character selector
   - Should be included in API request

## Security Considerations

1. **Authentication**: All endpoints require JWT auth except callback
2. **User Ownership**: Tasks verified by userId
3. **File Upload**: Max 5 files per request, 10MB limit
4. **Rate Limiting**: Applied to all /api routes
5. **Input Validation**: Prompt required, images validated

## Future Enhancements

- [ ] Add watermark support
- [ ] Support multiple image sizes per request
- [ ] Implement retry logic for failed tasks
- [ ] Add task cancellation
- [ ] Display generation progress percentage
- [ ] Cache completed tasks for faster history loading
- [ ] Add image download functionality
- [ ] Support batch generation (multiple images at once)
- [ ] Add negative prompts
- [ ] Style presets

## Troubleshooting

### Task Status Never Completes
- Check NanoBanana API key is valid
- Verify callback URL is accessible from internet
- Check server logs for callback errors
- Ensure firewall allows incoming connections

### Images Not Uploading
- Check LocalFileUploadService permissions
- Verify `uploads/` directory exists
- Check file size limits

### API Errors
- Check NANOBANANA_API_KEY in .env
- Verify API_BASE_URL is correct
- Check NanoBanana API status

## References

- [NanoBanana API Documentation](https://nanobananaapi.ai/docs)
- [API Key Management](https://nanobananaapi.ai/api-key)
