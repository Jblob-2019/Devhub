// API base URL configuration
// In development, Vite proxy handles /api -> http://localhost:4000
// In production, VITE_API_URL must be set to the backend URL

const getApiBase = (): string => {
  // Explicit env var takes priority
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // In development, use relative paths (Vite proxy handles it)
  if (import.meta.env.DEV) {
    return '';
  }

  // In production, missing VITE_API_URL is a deployment misconfiguration
  if (import.meta.env.PROD) {
    console.error(
      '[CONFIG ERROR] VITE_API_URL is not set in production! ' +
      'Requests to backend APIs will fail. Ensure VITE_API_URL is set in your hosting environment (e.g. Vercel).'
    );
  }

  // Fallback to same origin if window is defined
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

export const API_BASE = getApiBase();
