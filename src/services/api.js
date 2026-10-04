import axios from 'axios';

// Get base URL with fallback to local development
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';
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

// Singleton tracking for Render cold-start wake-up
let wakeInFlight = null;
let hasSentInitialPing = false;

/**
 * Lightweight Render Backend Wake-Up Service
 * Sends a single lightweight GET request to ${API_BASE_URL}/api/health when the frontend application loads.
 * - Non-blocking: fails silently without breaking frontend UI.
 * - Single-shot: runs once per page load (deduplicated across root, login, dashboard).
 * - No aggressive polling or loops.
 */
export async function pingBackendHealth(force = false) {
  if (hasSentInitialPing && !force) {
    return true;
  }
  if (wakeInFlight) {
    return wakeInFlight;
  }

  wakeInFlight = (async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`, {
        timeout: 15000,
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (response.data && response.data.status === 'ok') {
        hasSentInitialPing = true;
        return true;
      }
      return false;
    } catch (err) {
      // Fail silently without breaking the application
      if (import.meta.env.DEV) {
        console.warn('Backend /api/health ping (Render waking up):', err.message);
      }
      return false;
    } finally {
      wakeInFlight = null;
    }
  })();

  return wakeInFlight;
}

/**
 * Backward compatibility alias for Settings test connection
 */
export async function wakeBackend(onStatusChange = null) {
  if (onStatusChange) onStatusChange({ isWakingUp: true, attempt: 1 });
  const ok = await pingBackendHealth(true);
  if (onStatusChange) onStatusChange({ isWakingUp: false, isHealthy: ok });
  return ok;
}

