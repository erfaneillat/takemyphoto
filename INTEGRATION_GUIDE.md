# Frontend-Backend Integration Guide

## 🔗 Connecting Nero Frontend to Backend

This guide explains how to integrate the React frontend with the Node.js backend.

## 📡 API Configuration

### 1. Create API Client (Frontend)

Create `src/shared/services/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout user
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. Update Environment Variables (Frontend)

Create `.env` in frontend root:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

For production:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

## 🔐 Authentication Integration

### Update `useAuthStore.ts`

Replace mock functions with real API calls:

```typescript
import { apiClient } from '@/shared/services/api';

// Replace mockSendVerificationCode
const sendVerificationCode = async (phoneNumber: string): Promise<void> => {
  await apiClient.post('/auth/send-code', { phoneNumber });
};

// Replace mockVerifyCode
const verifyCode = async (phoneNumber: string, code: string): Promise<User> => {
  const response = await apiClient.post('/auth/verify-code', { phoneNumber, code });
  
  // Store tokens
  localStorage.setItem('accessToken', response.data.data.accessToken);
  localStorage.setItem('refreshToken', response.data.data.refreshToken);
  
  return response.data.data.user;
};

// Update the store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // ... existing state
      
      login: async (phoneNumber) => {
        set({ isLoading: true, error: null });
        try {
          await sendVerificationCode(phoneNumber);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to send code',
          });
          throw error;
        }
      },

      verifyCode: async (phoneNumber, code) => {
        set({ isLoading: true, error: null });
        try {
          const user = await verifyCode(phoneNumber, code);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Verification failed',
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'nero-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

## 👤 User Profile Integration

Create `src/shared/services/userService.ts`:

```typescript
import { apiClient } from './api';
import { User } from '@/core/domain/entities/User';

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data.data;
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    const response = await apiClient.patch('/users/profile', data);
    return response.data.data.user;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return response.data.data.user;
  },
};
```

## 🎭 Character Management Integration

Update `useCharacterStore.ts`:

```typescript
import { apiClient } from '@/shared/services/api';

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      characters: [],
      isLoading: false,
      error: null,

      // Fetch characters from backend
      fetchCharacters: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get('/characters');
          set({
            characters: response.data.data.characters,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to fetch characters',
          });
        }
      },

      createCharacter: async (data: CreateCharacterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const formData = new FormData();
          formData.append('name', data.name);
          data.images.forEach((image) => {
            formData.append('images', image);
          });

          const response = await apiClient.post('/characters', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          set((state) => ({
            characters: [response.data.data.character, ...state.characters],
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to create character',
          });
          throw error;
        }
      },

      deleteCharacter: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiClient.delete(`/characters/${id}`);
          set((state) => ({
            characters: state.characters.filter((char) => char.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to delete character',
          });
          throw error;
        }
      },

      getCharacterById: (id: string) => {
        return get().characters.find((char) => char.id === id);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'nero-character-storage',
      partialize: (state) => ({
        // Don't persist characters, fetch from server
      }),
    }
  )
);
```

## 🎨 Template/Explore Integration

Create `src/shared/services/templateService.ts`:

```typescript
import { apiClient } from './api';

export const templateService = {
  getTemplates: async (params?: {
    category?: string;
    search?: string;
    trending?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    const response = await apiClient.get('/templates', { params });
    return response.data.data.templates;
  },

  toggleFavorite: async (templateId: string) => {
    const response = await apiClient.post(`/templates/${templateId}/favorite`);
    return response.data.data;
  },
};
```

Update `ExplorePage.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { templateService } from '@/shared/services/templateService';

export const ExplorePage = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const data = await templateService.getTemplates({
          category: activeTab === 'all' ? undefined : activeTab,
          trending: activeTab === 'trending',
        });
        setTemplates(data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [activeTab]);

  // ... rest of component
};
```

## 🔄 Complete Integration Checklist

### Backend Setup
- [ ] Start MongoDB
- [ ] Configure `.env` file
- [ ] Run `npm install` in server folder
- [ ] Start backend with `npm run dev`
- [ ] Verify health endpoint: `http://localhost:5000/health`

### Frontend Setup
- [ ] Add `VITE_API_BASE_URL` to `.env`
- [ ] Create `src/shared/services/api.ts`
- [ ] Update `useAuthStore.ts` with API calls
- [ ] Update `useCharacterStore.ts` with API calls
- [ ] Create template service
- [ ] Test authentication flow
- [ ] Test character creation
- [ ] Test template browsing

### Testing Integration
1. **Test Authentication:**
   - Send verification code
   - Check console for code (in dev mode)
   - Verify code and login
   - Check localStorage for tokens

2. **Test Protected Routes:**
   - Access profile page
   - Create a character
   - View characters list

3. **Test File Upload:**
   - Upload character images
   - Verify images appear in Cloudinary
   - Check image URLs in response

## 🐛 Common Integration Issues

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution**: Update `CORS_ORIGIN` in backend `.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

### 401 Unauthorized
**Solution**: Check if token is being sent:
```typescript
// In browser console
localStorage.getItem('accessToken')
```

### Network Error
**Solution**: Verify backend is running:
```bash
curl http://localhost:5000/health
```

### File Upload Fails
**Solution**: Configure Cloudinary credentials in backend `.env`

## 📱 Mobile/Production Considerations

### Production URLs
Update frontend `.env.production`:
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

### HTTPS
Ensure backend uses HTTPS in production for secure token transmission.

### Token Refresh
Implement token refresh logic for better UX:
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        // Call refresh endpoint (implement in backend)
        const response = await axios.post('/auth/refresh', { refreshToken });
        
        localStorage.setItem('accessToken', response.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

## ✅ Verification

Test the complete flow:
1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd .. && npm run dev`
3. Open browser: `http://localhost:5173`
4. Test login flow
5. Test character creation
6. Test template browsing
7. Check network tab for API calls
8. Verify data persistence

## 🎉 Success!

Your frontend and backend are now integrated! All data flows through the API, and you have a complete full-stack application.
