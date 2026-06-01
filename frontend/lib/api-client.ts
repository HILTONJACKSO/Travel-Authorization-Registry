import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const BASE_URL = API_URL.replace('/api', '');

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const getStorageItem = (key: string) => localStorage.getItem(key) || sessionStorage.getItem(key);
    const token = getStorageItem('access_token');
    if (token) {
      console.log('[API] Sending token:', token.substring(0, 15) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('[API] No token found in storage for request:', config.url);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const getStorageItem = (key: string) => localStorage.getItem(key) || sessionStorage.getItem(key);
        const clearStorage = () => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
        };

        const refreshToken = getStorageItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        const { access } = response.data;
        
        if (localStorage.getItem('refresh_token')) {
          localStorage.setItem('access_token', access);
        } else {
          sessionStorage.setItem('access_token', access);
        }

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (err) {
        console.error('[API] Refresh failed or token missing:', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          console.warn('[API] Redirecting to login due to auth failure');
          window.location.href = '/?reason=session_expired';
        }
      }
    }
    return Promise.reject(error);
  }
);
