# Nero API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📱 Authentication Endpoints

### Send Verification Code
Send a 6-digit verification code to the user's phone number.

**Endpoint:** `POST /auth/send-code`

**Request Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Verification code sent successfully"
}
```

**Errors:**
- `400` - Invalid phone number format
- `500` - Failed to send SMS

---

### Verify Code
Verify the code and authenticate the user.

**Endpoint:** `POST /auth/verify-code`

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "phoneNumber": "+1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "subscription": "free",
      "stars": 3,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- `400` - Invalid code format
- `401` - Invalid or expired verification code
- `429` - Too many attempts

---

## 👤 User Endpoints

### Get Current User
Get the authenticated user's basic information.

**Endpoint:** `GET /users/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "phoneNumber": "+1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "subscription": "free",
      "stars": 3,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Get User Profile
Get user profile with statistics.

**Endpoint:** `GET /users/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": { ... },
    "stats": {
      "totalEdits": 42,
      "editsThisMonth": 12,
      "favoriteCount": 8
    }
  }
}
```

---

### Update User Profile
Update user's profile information.

**Endpoint:** `PATCH /users/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": { ... }
  }
}
```

---

## 🎭 Character Endpoints

### Create Character
Create a new character with 3-5 images.

**Endpoint:** `POST /characters`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `name` (string, required): Character name
- `images` (files, required): 3-5 image files (JPEG, PNG, WebP)

**Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "character": {
      "id": "character_id",
      "userId": "user_id",
      "name": "My Character",
      "images": [
        {
          "id": "img_1",
          "url": "https://res.cloudinary.com/...",
          "publicId": "nero/characters/user_id/...",
          "order": 0
        },
        // ... more images
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Errors:**
- `400` - Invalid image count (must be 3-5)
- `400` - Invalid file type
- `413` - File too large

---

### Get User Characters
Get all characters for the authenticated user.

**Endpoint:** `GET /characters`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "characters": [
      {
        "id": "character_id",
        "userId": "user_id",
        "name": "My Character",
        "images": [ ... ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### Delete Character
Delete a character and its images.

**Endpoint:** `DELETE /characters/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Character deleted successfully"
}
```

**Errors:**
- `404` - Character not found
- `403` - Unauthorized to delete this character

---

## 🎨 Template Endpoints

### Get Templates
Get templates with optional filtering.

**Endpoint:** `GET /templates`

**Query Parameters:**
- `category` (string, optional): Filter by category (e.g., "portrait", "landscape")
- `search` (string, optional): Search in prompts and tags
- `trending` (boolean, optional): Get trending templates (dynamically calculated)
- `trendingPeriod` (string, optional): Period for trending calculation - "week" or "month" (default: "week")
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "templates": [
      {
        "id": "template_id",
        "imageUrl": "https://res.cloudinary.com/...",
        "publicId": "nero/templates/...",
        "prompt": "A beautiful sunset over mountains",
        "style": "realistic",
        "category": "landscape",
        "tags": ["sunset", "mountains", "nature"],
        "isTrending": true,
        "viewCount": 1234,
        "likeCount": 567,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Examples:**
```bash
# Get all templates
GET /templates

# Get trending templates (last week)
GET /templates?trending=true

# Get trending templates (last month)
GET /templates?trending=true&trendingPeriod=month

# Get templates by category
GET /templates?category=portrait&limit=20

# Search templates
GET /templates?search=sunset&limit=10

# Pagination
GET /templates?limit=20&offset=40
```

---

### Toggle Favorite Template
Add or remove a template from favorites.

**Endpoint:** `POST /templates/:templateId/favorite`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "isFavorite": true
  }
}
```

**Errors:**
- `404` - Template not found

---

## 🚨 Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

**Validation Errors:**
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    {
      "field": "phoneNumber",
      "message": "Invalid phone number format"
    }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `413` - Payload Too Large
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## 🔐 Rate Limiting

API requests are rate-limited to prevent abuse:
- **Window:** 15 minutes
- **Max Requests:** 100 per IP

When rate limit is exceeded:
```json
{
  "status": "error",
  "message": "Too many requests from this IP, please try again later"
}
```

---

## 📝 Notes

1. **Phone Number Format:** Use E.164 format (e.g., +1234567890)
2. **Image Upload:** Max file size is 10MB per image
3. **Supported Image Formats:** JPEG, PNG, WebP
4. **JWT Token Expiry:** Access tokens expire in 7 days
5. **Development Mode:** SMS codes are logged to console instead of being sent

---

## 🧪 Testing with cURL

**Send Verification Code:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

**Verify Code:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "code": "123456"}'
```

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Character:**
```bash
curl -X POST http://localhost:5000/api/v1/characters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=My Character" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg"
```
