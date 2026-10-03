import axios from 'axios';

// Get base URL with fallback to local development
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 45000, // 45 seconds for cold-start wakeups / OCR
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kanakku_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('kanakku_token');
      localStorage.removeItem('kanakku_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Render Backend Wake-Up Service
 * Calls GET /health with exponential backoff (e.g., immediate, 2s, 4s, 8s, max 4 attempts)
 * Never creates an infinite retry loop.
 */
export async function wakeBackend(onStatusChange = null) {
  const delays = [0, 2000, 4000, 8000];
  let attempt = 0;

  for (const delay of delays) {
    attempt++;
    if (delay > 0) {
      if (onStatusChange) onStatusChange({ isWakingUp: true, attempt });
      await new Promise((res) => setTimeout(res, delay));
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 6000 });
      if (response.data && response.data.status === 'ok') {
        if (onStatusChange) onStatusChange({ isWakingUp: false, isHealthy: true });
        return true;
      }
    } catch (err) {
      console.warn(`Health check attempt ${attempt} failed (Backend might be waking up).`);
    }
  }

  if (onStatusChange) onStatusChange({ isWakingUp: false, isHealthy: false });
  return false;
}
