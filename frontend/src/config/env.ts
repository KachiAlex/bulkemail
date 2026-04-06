// Force production to use /api regardless of environment variables
const isProduction = import.meta.env.MODE === 'production';
const isLocalDevelopmentHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

// Use forced variables from Vite define in production
export const API_BASE_URL = isProduction
  ? (typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : '/api')
  : isLocalDevelopmentHost
    ? (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000/api')
    : '/api';

export const API_TIMEOUT_MS = Number(
  typeof __API_TIMEOUT_MS__ !== 'undefined' ? __API_TIMEOUT_MS__ : (import.meta.env.VITE_API_TIMEOUT_MS ?? 30000)
);
