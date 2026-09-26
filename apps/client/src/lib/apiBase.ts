// API base URL configuration
// In development, Vite proxy handles /api -> http://localhost:4000
// In production, VITE_API_URL must be set to the backend URL

const getApiBase = (): string => {
  // Explicit env var takes priority
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In development, use relative paths (Vite proxy handles it)
  if (import.meta.env.DEV) {
    return '';
  }

  // In production without VITE_API_URL, fallback to same origin
  // This assumes frontend and backend are on same domain
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // SSR/build-time fallback (should not happen in production)
  return '';
};

export const API_BASE = getApiBase();
