import axios, { AxiosError } from 'axios';

export const resolveApiBase = () => {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined
  // If no env set, use same-origin relative path
  if (!raw) return '/api/v1'

  // If page is https but env uses http, upgrade to https to avoid mixed content
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && raw.startsWith('http://')) {
    try {
      const u = new URL(raw)
      u.protocol = 'https:'
      return u.toString()
    } catch {
      // fall through to raw
    }
  }
  return raw
}

const API_BASE_URL = resolveApiBase();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, let the browser set the correct multipart boundary
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    if (isFormData && config.headers) {
      delete (config.headers as any)['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired - logout user
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
