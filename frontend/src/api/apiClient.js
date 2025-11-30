import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Normalize API base URL:
// - If env provided, ensure it ends with '/api' (handles cases where only host is set)
// - Otherwise fallback to relative '/api' in production (Vercel rewrite)
// - And to localhost in development.
const normalizeApiUrl = (url) => {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!u.pathname.startsWith('/api')) {
      // append '/api' preserving existing path if any
      u.pathname = (u.pathname.endsWith('/') ? u.pathname.slice(0, -1) : u.pathname) + '/api';
      return u.toString();
    }
    return url;
  } catch {
    // Not an absolute URL; return as-is
    return url;
  }
};

const rawEnvUrl = import.meta.env.VITE_API_URL;
const API_URL = normalizeApiUrl(rawEnvUrl) || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
