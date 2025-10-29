# Image to Prompt - Quick Start Guide

## 🚀 Setup (2 steps)

### 1. Add your OpenAI API Key
Edit `/server/.env` and add:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

Get your key from: https://platform.openai.com/api-keys

### 2. Restart the server
```bash
cd server
npm run dev
```

---

## 🧪 Test the API

### Using cURL
```bash
curl -X POST http://localhost:2000/api/v1/enhance/image-to-prompt \
  -F "image=@/path/to/your/image.jpg"
```

### Expected Response
```json
{
  "status": "success",
  "data": {
    "prompt": "A vibrant sunset over a calm ocean with warm orange and pink hues reflecting on the water, featuring silhouettes of palm trees in the foreground and a dramatic sky with scattered clouds",
    "detectedElements": [
      "sunset sky",
      "ocean water",
      "palm trees",
      "clouds",
      "warm colors",
      "silhouettes"
    ]
  }
}
```

---

## 📋 What Was Built

### Backend Files Created
- ✅ `/server/src/infrastructure/services/OpenAIService.ts` - Vision API integration
- ✅ `/server/src/application/usecases/enhance/ImageToPromptUseCase.ts` - Business logic

### Backend Files Modified
- ✅ `/server/.env.example` - Added OPENAI_API_KEY
- ✅ `/server/src/presentation/controllers/EnhanceController.ts` - Added endpoint handler
- ✅ `/server/src/presentation/routes/enhanceRoutes.ts` - Added route
- ✅ `/server/src/infrastructure/di/container.ts` - Wired dependencies

---

## 🎯 API Endpoint

**POST** `/api/v1/enhance/image-to-prompt`

- **Input:** Image file (multipart/form-data)
- **Output:** JSON with prompt and detected elements
- **Auth:** Not required (public endpoint)
- **Max file size:** 10MB (configurable)

---

## 💰 Cost

Using OpenAI GPT-4 Vision API:
- ~$0.01-0.05 per image analysis
- Charges based on image size and response tokens

---

## 🔧 Next Steps (Frontend)

To add the UI, create:
1. `/src/features/enhance/ImageToPromptPage.tsx` - Main page component
2. `/src/features/enhance/hooks/useImageToPrompt.ts` - State management hook
3. Add route in `/src/App.tsx`
4. Add tool card in `/src/features/tools/hooks/useToolsState.ts`
5. Add translations in `/src/shared/translations/`

---

## 📦 Dependencies

- ✅ `axios` - Already installed
- ✅ `multer` - Already installed  
- ✅ `express` - Already installed

---

## ⚠️ Important Notes

1. **API Key Required** - The feature won't work without a valid OpenAI API key
2. **Costs Apply** - Each image analysis costs money (see pricing above)
3. **Rate Limits** - OpenAI has rate limits, consider adding request throttling
4. **Image Size** - Larger images cost more, consider resizing before sending
5. **Public Endpoint** - Currently no authentication required

---

## 🐛 Troubleshooting

**Error: "OpenAI API key is not configured"**
- Add `OPENAI_API_KEY` to `/server/.env`
- Restart the server

**Error: "Incorrect API key provided"**
- Verify your API key at https://platform.openai.com/api-keys
- Make sure there are no extra spaces or quotes

**Error: "Rate limit exceeded"**
- You've hit OpenAI's rate limit
- Wait a minute and try again
- Consider upgrading your OpenAI plan

**Error: "Model not found"**
- Your API key might not have access to GPT-4 Vision
- Check your OpenAI account tier
